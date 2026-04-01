import type { Address, Hash, Hex, RpcLog } from 'viem'

import { BLOCKSCOUT_URL } from '@/lib/constants'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

const MAX_PAGES = 200
const REQUEST_TIMEOUT_MS = 25_000

interface BlockscoutLogsResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[] | null
}

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

export async function fetchLogsByTopic({
  address,
  topic0,
  fromBlock: initialFromBlock = '0',
  topic1,
  topic0_1_opr,
}: FetchLogsByTopicParams): Promise<{ data: RpcLog[] }> {
  const allLogs: RpcLog[] = []
  const seenKeys = new Set<string>()
  let fromBlock = initialFromBlock
  let pages = 0

  while (pages < MAX_PAGES) {
    pages += 1

    const params: Record<string, string> = {
      module: 'logs',
      action: 'getLogs',
      address: address.toLowerCase(),
      toBlock: 'latest',
      fromBlock,
      topic0: topic0.toLowerCase(),
    }

    if (topic1) {
      params.topic1 = topic1.toLowerCase()
    }
    if (topic0_1_opr) {
      params.topic0_1_opr = topic0_1_opr
    }

    const url = new URL(`${BLOCKSCOUT_URL}/api`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value)
    }

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!response.ok) {
      throw new Error(`Blockscout getLogs failed: HTTP ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as BlockscoutLogsResponse

    // Blockscout returns status: '1' on success, other values indicate errors
    if (data.status !== '1') {
      throw new Error(`Blockscout error: ${data.message || 'unknown error'} (status: ${data.status})`)
    }

    // Handle missing result field
    if (!data.result) {
      throw new Error('Blockscout error: missing result field')
    }

    // No more logs found
    if (data.result.length === 0) {
      break
    }

    for (const row of data.result) {
      const key = `${row.transactionHash}-${row.logIndex}`
      if (seenKeys.has(key)) continue
      seenKeys.add(key)
      allLogs.push(toRpcLog(row))
    }

    // Blockscout returns blockNumber as hex string (0x...). Convert to decimal for pagination.
    const lastBlockNumberHex = data.result[data.result.length - 1].blockNumber
    const lastBlockNumber = parseInt(lastBlockNumberHex, 16).toString()

    // If we're still on the same block, pagination is complete
    // (all logs from this block have been retrieved)
    if (lastBlockNumber === fromBlock) {
      break
    }

    fromBlock = lastBlockNumber
  }

  // Note: if pagination hits MAX_PAGES limit, results may be incomplete.
  // Consider monitoring logs if this becomes an issue in production.
  return { data: allLogs }
}
