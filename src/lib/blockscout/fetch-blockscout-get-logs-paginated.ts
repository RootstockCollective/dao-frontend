import type { Address, Hex } from 'viem'

import { BLOCKSCOUT_URL } from '@/lib/constants'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import { throttledBlockscoutFetch } from './request-throttle'

/**
 * Max getLogs pages per call chain to cap explorer load (same as legacy `fetchLogsByTopic`).
 * Beyond this, pagination stops and returned logs may be incomplete—monitor if that becomes likely.
 */
export const BLOCKSCOUT_GET_LOGS_MAX_PAGES = 200

/**
 * Network budget for a single getLogs page, applied per attempt from the moment the request leaves
 * the throttle queue. Queue wait and retry backoff deliberately sit outside it.
 */
const REQUEST_TIMEOUT_MS = 25_000

interface BlockscoutLogsResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[] | null
}

/**
 * Typed subset of Blockscout `module=logs&action=getLogs` query fields.
 * Only these keys are serialized; avoids open-ended query objects at call sites.
 *
 * @example Minimal query (serializes to URL query params; `module`/`action` added by the client):
 * ```json
 * {
 *   "address": "0xc4b091d97ad25cea5922f09fe80711b7acbbb16f",
 *   "topic0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
 *   "fromBlock": "0",
 *   "toBlock": "latest"
 * }
 * ```
 */
export interface BlockscoutGetLogsQuery {
  address: Address
  topic0: Hex
  /** Decimal or hex block string; default `'0'`. */
  fromBlock?: string
  /** Default `'latest'`. */
  toBlock?: string
  topic1?: Hex
  topic2?: Hex
  topic0_1_opr?: 'and' | 'or'
  topic0_2_opr?: 'and' | 'or'
  topic1_2_opr?: 'and' | 'or'
}

/**
 * Optional `fetch` init merged after defaults. Use `next.revalidate` in Next.js Route Handlers.
 *
 * A `signal` here means caller-driven cancellation: it is composed with each attempt's own deadline
 * rather than replacing it, and once it aborts no further attempts are made. It is not a way to set
 * the request timeout — {@link REQUEST_TIMEOUT_MS} owns that, per attempt.
 */
export type BlockscoutGetLogsFetchInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] }
}

/**
 * Arguments for {@link fetchBlockscoutGetLogsPaginated}.
 *
 * @property query — Contract + topics (+ optional block range) sent to Blockscout `getLogs`.
 * @property blockscoutBaseUrl — Explorer origin without trailing slash; defaults to {@link BLOCKSCOUT_URL}.
 * @property fetchInit — Merged into `fetch` after the default timeout signal (e.g. `next.revalidate` in Route Handlers).
 */
export interface FetchBlockscoutGetLogsPaginatedParams {
  query: BlockscoutGetLogsQuery
  blockscoutBaseUrl?: string
  fetchInit?: BlockscoutGetLogsFetchInit
  /** Per-attempt network budget; defaults to {@link REQUEST_TIMEOUT_MS}. */
  timeoutMs?: number
}

/** Flattens {@link BlockscoutGetLogsQuery} plus the current pagination `fromBlock` into URL search params. */
function buildPageParams(query: BlockscoutGetLogsQuery, fromBlock: string): Record<string, string> {
  const params: Record<string, string> = {
    module: 'logs',
    action: 'getLogs',
    address: query.address.toLowerCase(),
    toBlock: query.toBlock ?? 'latest',
    fromBlock,
    topic0: query.topic0.toLowerCase(),
  }

  if (query.topic1 !== undefined) {
    params.topic1 = query.topic1.toLowerCase()
  }
  if (query.topic2 !== undefined) {
    params.topic2 = query.topic2.toLowerCase()
  }
  if (query.topic0_1_opr !== undefined) {
    params.topic0_1_opr = query.topic0_1_opr
  }
  if (query.topic0_2_opr !== undefined) {
    params.topic0_2_opr = query.topic0_2_opr
  }
  if (query.topic1_2_opr !== undefined) {
    params.topic1_2_opr = query.topic1_2_opr
  }

  return params
}

/**
 * Fetches all matching logs from Blockscout `getLogs` using `fromBlock` pagination,
 * deduplicating by `transactionHash` + `logIndex`.
 *
 * @param params.query — Typed getLogs filter (address, topics, optional block bounds).
 * @param params.blockscoutBaseUrl — Optional explorer base; defaults to {@link BLOCKSCOUT_URL}.
 * @param params.fetchInit — Optional `fetch` options merged after defaults.
 * @returns Raw log rows as returned by Blockscout (includes `timeStamp` for server-side use).
 *
 * @remarks
 * - Every page goes through {@link throttledBlockscoutFetch}, so calls are paced process-wide and
 *   retried on 429/5xx. Expect wall-clock time to grow with page count under contention: queue wait
 *   is unbounded by design here, and only the network leg of each attempt is capped.
 * - If pagination reaches {@link BLOCKSCOUT_GET_LOGS_MAX_PAGES}, fetching stops and the result set may be truncated.
 * - **Empty `getLogs` responses:** Blockscout sometimes returns `status: '0'` with `result` `null` or `[]` when no
 *   logs match (e.g. message `No records found`). That is treated as a normal empty page—pagination ends and the
 *   function returns accumulated rows (often `[]`). **This is the single place that encodes that rule** for this
 *   API client; {@link fetchLogsByTopic} calls here and does not re-check. Prefer importing this module over copying
 *   raw Blockscout `getLogs` response handling elsewhere.
 *
 * @see {@link fetchLogsByTopic} — Maps rows to viem `RpcLog` (omits Blockscout-only fields like `timeStamp`).
 *
 * @throws On non-OK HTTP; when `status === '1'` but `result` is missing; or when `status !== '1'` and the response
 *   is not the empty case above (`status === '0'` with null/empty `result`—other failure statuses/messages still throw).
 *
 * @example HTTP JSON body shape (one row in `result`; fields mirror Blockscout RPC):
 * ```json
 * {
 *   "status": "1",
 *   "message": "OK",
 *   "result": [
 *     {
 *       "address": "0x…",
 *       "blockNumber": "0x1a2b3c",
 *       "data": "0x0de0b6b3a7640000",
 *       "logIndex": "0x0",
 *       "timeStamp": "0x5f5e100",
 *       "topics": ["0xddf2…", "0x000…", "0x000…"],
 *       "transactionHash": "0xabc…",
 *       "transactionIndex": "0x0",
 *       "gasPrice": "0x0",
 *       "gasUsed": "0x0"
 *     }
 *   ]
 * }
 * ```
 */
export async function fetchBlockscoutGetLogsPaginated({
  query,
  blockscoutBaseUrl = BLOCKSCOUT_URL,
  fetchInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: FetchBlockscoutGetLogsPaginatedParams): Promise<BackendEventByTopic0ResponseValue[]> {
  const base = blockscoutBaseUrl.replace(/\/$/, '')
  const allLogs: BackendEventByTopic0ResponseValue[] = []
  const seenKeys = new Set<string>()
  let fromBlock = query.fromBlock ?? '0'
  let pages = 0

  while (pages < BLOCKSCOUT_GET_LOGS_MAX_PAGES) {
    pages += 1

    const params = buildPageParams(query, fromBlock)
    const url = new URL(`${base}/api`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value)
    }

    // Paced + retried: Blockscout rate-limits per IP and answers 429 well below our natural fan-out.
    // The timeout is handed over rather than pre-built, so it starts when the request leaves the
    // queue instead of when it joins it — otherwise a paced request aborts before it ever runs.
    const response = await throttledBlockscoutFetch(url.toString(), fetchInit ?? {}, { timeoutMs })

    if (!response.ok) {
      throw new Error(`Blockscout getLogs failed: HTTP ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as BlockscoutLogsResponse

    if (data.status !== '1') {
      if (data.status === '0' && (!data.result || data.result.length === 0)) {
        break
      }
      throw new Error(`Blockscout error: ${data.message || 'unknown error'} (status: ${data.status})`)
    }

    if (!data.result) {
      throw new Error('Blockscout error: missing result field')
    }

    if (data.result.length === 0) {
      break
    }

    for (const row of data.result) {
      const key = `${row.transactionHash}-${row.logIndex}`
      if (seenKeys.has(key)) {
        continue
      }
      seenKeys.add(key)
      allLogs.push(row)
    }

    const lastBlockNumberHex = data.result[data.result.length - 1].blockNumber
    const lastBlockNumber = parseInt(lastBlockNumberHex, 16).toString()

    if (lastBlockNumber === fromBlock) {
      break
    }

    fromBlock = lastBlockNumber
  }

  return allLogs
}
