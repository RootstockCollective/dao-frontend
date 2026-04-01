import type { Address, Hex } from 'viem'

import { BLOCKSCOUT_URL } from '@/lib/constants'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

/**
 * Max getLogs pages per call chain to cap explorer load (same as legacy `fetchLogsByTopic`).
 * Beyond this, pagination stops and returned logs may be incomplete—monitor if that becomes likely.
 */
export const BLOCKSCOUT_GET_LOGS_MAX_PAGES = 200

const REQUEST_TIMEOUT_MS = 25_000

interface BlockscoutLogsResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[] | null
}

/**
 * Typed subset of Blockscout `module=logs&action=getLogs` query fields.
 * Only these keys are serialized; avoids open-ended query objects at call sites.
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
 * Optional `fetch` init merged after defaults. Use `next.revalidate` in Next.js Route Handlers;
 * pass `signal` to override the default `AbortSignal.timeout`.
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
 * @remarks If pagination reaches {@link BLOCKSCOUT_GET_LOGS_MAX_PAGES}, fetching stops and the result set may be truncated.
 *
 * @see {@link fetchLogsByTopic} — Maps rows to viem `RpcLog` (omits Blockscout-only fields like `timeStamp`).
 *
 * @throws On non-OK HTTP, Blockscout `status !== '1'`, or missing `result` when success is claimed.
 */
export async function fetchBlockscoutGetLogsPaginated({
  query,
  blockscoutBaseUrl = BLOCKSCOUT_URL,
  fetchInit,
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

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...fetchInit,
    })

    if (!response.ok) {
      throw new Error(`Blockscout getLogs failed: HTTP ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as BlockscoutLogsResponse

    if (data.status !== '1') {
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
