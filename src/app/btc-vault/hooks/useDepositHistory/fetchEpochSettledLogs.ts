import { type Address, getAddress, type Hash, type Hex, type Log, parseEventLogs } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { BLOCKSCOUT_URL, RBTC_VAULT_ADDRESS } from '@/lib/constants'
import { type BackendEventByTopic0ResponseValue } from '@/shared/utils'

/** Decoded fields from a single EpochSettled event. */
export interface EpochSettledEvent {
  epochId: bigint
  reportedOffchainAssets: bigint
  assets: bigint
  supply: bigint
  closedAt: bigint
}

/** Blockscout RPC API response structure for getLogs. */
interface BlockscoutLogResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[]
}

// keccak256('EpochSettled(uint256,uint256,uint256,uint256,uint64)')
const EPOCH_SETTLED_TOPIC0: Hex = '0x6511c76b779d65cb4d37d0e41cd72898323cdabc5110af18ebbf47c700946d5f'

/** Convert topics array from Blockscout format to viem-compatible tuple. */
function toTopics(topics: Array<null | string>): [] | [Hex, ...Hex[]] {
  const filtered = topics.filter((t): t is string => t !== null)
  if (filtered.length === 0) return []
  return filtered as [Hex, ...Hex[]]
}

/** Convert a Blockscout RPC log into a viem-compatible `Log`. */
function toViemLog(log: BackendEventByTopic0ResponseValue): Log {
  return {
    address: getAddress(log.address) as Address,
    blockHash: null,
    blockNumber: BigInt(log.blockNumber),
    data: log.data as Hash,
    logIndex: Number(log.logIndex),
    transactionHash: log.transactionHash as Hash,
    transactionIndex: Number(log.transactionIndex),
    removed: false,
    topics: toTopics(log.topics),
  }
}

/**
 * Fetches all `EpochSettled` event logs for the rBTC vault from the
 * Blockscout RPC API (`/api?module=logs&action=getLogs`), handling
 * fromBlock-based pagination.
 *
 * Returns decoded events sorted **descending** by epochId (newest first).
 */
export async function fetchEpochSettledLogs(): Promise<EpochSettledEvent[]> {
  const allLogs: BackendEventByTopic0ResponseValue[] = []
  let fromBlock = '0'

  while (true) {
    const params: Record<string, string> = {
      module: 'logs',
      action: 'getLogs',
      address: RBTC_VAULT_ADDRESS.toLowerCase(),
      topic0: EPOCH_SETTLED_TOPIC0,
      toBlock: 'latest',
      fromBlock,
    }

    const url = new URL(`${BLOCKSCOUT_URL}/api`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value)
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status} ${response.statusText}`)
    }

    const data: BlockscoutLogResponse = await response.json()

    if (data.status !== '1' || !data.result) {
      break
    }

    if (data.result.length === 0) break

    // Blockscout returns blockNumber as hex — convert to decimal for pagination
    const lastBlockNumberHex = data.result[data.result.length - 1].blockNumber
    const lastBlockNumber = parseInt(lastBlockNumberHex, 16).toString()

    // If last block equals fromBlock, we've reached the end
    if (lastBlockNumber === fromBlock) {
      allLogs.push(...data.result)
      break
    }

    allLogs.push(...data.result)
    fromBlock = lastBlockNumber
  }

  const viemLogs = allLogs.map(toViemLog)

  const parsed = parseEventLogs({
    abi: RBTCAsyncVaultAbi,
    logs: viemLogs,
    eventName: 'EpochSettled',
  })

  // Deduplicate by epochId — fromBlock pagination can return overlapping logs
  const seen = new Set<bigint>()
  const events: EpochSettledEvent[] = []

  for (const e of parsed) {
    if (seen.has(e.args.epochId)) continue
    seen.add(e.args.epochId)
    events.push({
      epochId: e.args.epochId,
      reportedOffchainAssets: e.args.reportedOffchainAssets,
      assets: e.args.assets,
      supply: e.args.supply,
      closedAt: e.args.closedAt,
    })
  }

  // Sort descending by epochId (newest first)
  events.sort((a, b) => (b.epochId > a.epochId ? 1 : b.epochId < a.epochId ? -1 : 0))

  return events
}
