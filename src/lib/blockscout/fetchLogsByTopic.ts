import type { Hex, RpcLog } from 'viem'

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
  address: string
  topic0: Hex
  fromBlock?: string
  topic1?: Hex
  topic0_1_opr?: 'and'
}

function toRpcLog(log: BackendEventByTopic0ResponseValue): RpcLog {
  return {
    address: log.address as `0x${string}`,
    blockHash: null,
    blockNumber: log.blockNumber as `0x${string}`,
    data: log.data as `0x${string}`,
    logIndex: log.logIndex as `0x${string}`,
    transactionHash: log.transactionHash as `0x${string}`,
    transactionIndex: log.transactionIndex as `0x${string}`,
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

    if (data.status !== '1' || !data.result) {
      break
    }

    if (data.result.length === 0) break

    for (const row of data.result) {
      const key = `${row.transactionHash}-${row.logIndex}`
      if (seenKeys.has(key)) continue
      seenKeys.add(key)
      allLogs.push(toRpcLog(row))
    }

    const lastBlockNumberHex = data.result[data.result.length - 1].blockNumber
    const lastBlockNumber = parseInt(lastBlockNumberHex, 16).toString()

    if (lastBlockNumber === fromBlock) {
      break
    }

    fromBlock = lastBlockNumber
  }

  return { data: allLogs }
}
