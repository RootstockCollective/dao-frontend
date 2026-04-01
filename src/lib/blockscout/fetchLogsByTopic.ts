import type { Address, Hash, Hex, RpcLog } from 'viem'

import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import { fetchBlockscoutGetLogsPaginated } from './fetchBlockscoutGetLogsPaginated'

interface FetchLogsByTopicParams {
  address: Address
  topic0: Hex
  fromBlock?: string
  topic1?: Hex
  topic0_1_opr?: 'and' | 'or'
}

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
 * @throws Same as {@link fetchBlockscoutGetLogsPaginated} (HTTP errors, Blockscout error status, missing `result`).
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
