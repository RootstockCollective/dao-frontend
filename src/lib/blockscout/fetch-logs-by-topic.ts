import type { Address, Hash, Hex, RpcLog } from 'viem'

import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import { fetchBlockscoutGetLogsPaginated } from './fetch-blockscout-get-logs-paginated'

/**
 * Arguments forwarded into {@link fetchBlockscoutGetLogsPaginated}'s `query` (topic2 / extra operators not exposed here).
 */
interface FetchLogsByTopicParams {
  /** Contract that emitted the logs. */
  address: Address
  /** Event signature topic (keccak hex). */
  topic0: Hex
  /** Pagination start as decimal string; default `'0'`. */
  fromBlock?: string
  /** Optional indexed argument topic. */
  topic1?: Hex
  /** How `topic0` and `topic1` combine when both are set. */
  topic0_1_opr?: 'and' | 'or'
}

/** Maps a Blockscout log row into viem {@link RpcLog}; strips `null` entries from `topics`. */
function toRpcLog(log: BackendEventByTopic0ResponseValue): RpcLog {
  return {
    address: log.address as Address,
    blockHash: null,
    blockNumber: log.blockNumber as Hex,
    data: log.data as Hex,
    logIndex: log.logIndex as Hex,
    transactionHash: log.transactionHash as Hash,
    transactionIndex: log.transactionIndex as Hex,
    removed: false,
    topics: log.topics.filter((t): t is string => t !== null) as [] | [Hex, ...Hex[]],
  }
}

/**
 * Fetches event logs from Blockscout for a contract `address` and `topic0`, optionally scoped by `topic1`
 * and `topic0_1_opr`. Uses {@link fetchBlockscoutGetLogsPaginated} for pagination and maps rows to viem {@link RpcLog}
 * (Blockscout `timeStamp` is not part of `RpcLog`).
 *
 * @param address — Contract that emitted the logs.
 * @param topic0 — Event signature topic (keccak hex).
 * @param fromBlock — Pagination start (decimal string); default `'0'`.
 * @param topic1 — Optional indexed argument topic.
 * @param topic0_1_opr — How `topic0` and `topic1` combine (`and` / `or`).
 * @returns `{ data }` where `data` is deduped {@link RpcLog} entries in fetch order across pages.
 *
 * @see {@link fetchBlockscoutGetLogsPaginated} — Use directly when you need `topic2`, extra operators, or raw rows.
 *
 * @throws Same as {@link fetchBlockscoutGetLogsPaginated} (including empty-handling: no duplicate logic here).
 *
 * @example Request-style input (TypeScript call):
 * ```ts
 * await fetchLogsByTopic({
 *   address: '0xYourContract',
 *   topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
 *   fromBlock: '0',
 *   topic1: '0x0000000000000000000000000000000000000000000000000000000000000000',
 *   topic0_1_opr: 'and',
 * })
 * ```
 *
 * @example Return payload (viem `RpcLog`; no Blockscout `timeStamp`):
 * ```json
 * {
 *   "data": [
 *     {
 *       "address": "0x…",
 *       "blockHash": null,
 *       "blockNumber": "0x1a2b3c",
 *       "data": "0x0de0b6b3a7640000",
 *       "logIndex": "0x0",
 *       "transactionHash": "0xabc…",
 *       "transactionIndex": "0x0",
 *       "removed": false,
 *       "topics": ["0xddf2…", "0x…"]
 *     }
 *   ]
 * }
 * ```
 */
export async function fetchLogsByTopic({
  address,
  topic0,
  fromBlock: initialFromBlock = '0',
  topic1,
  topic0_1_opr,
}: FetchLogsByTopicParams): Promise<{ data: RpcLog[] }> {
  const rows = await fetchBlockscoutGetLogsPaginated({
    query: {
      address,
      topic0,
      fromBlock: initialFromBlock,
      topic1,
      topic0_1_opr,
    },
  })

  return { data: rows.map(toRpcLog) }
}
