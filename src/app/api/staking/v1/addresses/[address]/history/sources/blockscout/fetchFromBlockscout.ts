import type { StakingAction, StakingHistoryByPeriodAndAction, StakingHistoryTransaction } from '../../types'
import { txTimestamp } from '../shared/query'

const BLOCKSCOUT_URL = (
  process.env.NEXT_PUBLIC_BLOCKSCOUT_URL ?? 'https://rootstock-testnet.blockscout.com'
).replace(/\/$/, '')
const STRIF_CONTRACT = (
  process.env.NEXT_PUBLIC_STRIF_ADDRESS ?? '0xC4b091d97AD25ceA5922f09fe80711B7ACBbb16f'
).toLowerCase()

const TRANSFER_TOPIC0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ZERO_TOPIC = '0x0000000000000000000000000000000000000000000000000000000000000000'

interface BlockscoutLog {
  blockNumber: string
  data: string
  logIndex: string
  timeStamp: string
  topics: Array<string | null>
  transactionHash: string
}

interface BlockscoutResponse {
  status: string
  result: BlockscoutLog[] | string
}

function padAddress(address: string): string {
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`
}

async function fetchAllLogs(params: Record<string, string>): Promise<BlockscoutLog[]> {
  const allLogs: BlockscoutLog[] = []
  const seen = new Set<string>()
  let fromBlock = '0'

  while (true) {
    const url = new URL(`${BLOCKSCOUT_URL}/api`)
    const queryParams = { ...params, fromBlock, toBlock: 'latest' }
    for (const [k, v] of Object.entries(queryParams)) {
      url.searchParams.append(k, v)
    }

    const response = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!response.ok) {
      throw new Error(`Blockscout staking history: HTTP ${response.status}`)
    }

    const data = (await response.json()) as BlockscoutResponse
    if (data.status !== '1' || !Array.isArray(data.result) || data.result.length === 0) {
      break
    }

    const lastBlockHex = data.result[data.result.length - 1].blockNumber
    const lastBlock = parseInt(lastBlockHex, 16).toString()

    for (const log of data.result) {
      const key = `${log.transactionHash}:${log.logIndex}`
      if (!seen.has(key)) {
        seen.add(key)
        allLogs.push(log)
      }
    }

    if (lastBlock === fromBlock) break
    fromBlock = lastBlock
  }

  return allLogs
}

function buildLogParams(paddedUser: string, action: StakingAction): Record<string, string> {
  const isStake = action === 'STAKE'
  return {
    module: 'logs',
    action: 'getLogs',
    address: STRIF_CONTRACT,
    topic0: TRANSFER_TOPIC0,
    topic1: isStake ? ZERO_TOPIC : paddedUser,
    topic2: isStake ? paddedUser : ZERO_TOPIC,
    topic0_1_opr: 'and',
    topic0_2_opr: 'and',
    topic1_2_opr: 'and',
  }
}

function logToTransaction(
  log: BlockscoutLog,
  action: StakingAction,
  user: string,
): StakingHistoryTransaction {
  return {
    user,
    action,
    amount: BigInt(log.data).toString(),
    blockNumber: parseInt(log.blockNumber, 16).toString(),
    blockHash: null,
    timestamp: parseInt(log.timeStamp, 16),
    transactionHash: log.transactionHash,
  }
}

function groupByPeriodAndAction(
  transactions: StakingHistoryTransaction[],
): StakingHistoryByPeriodAndAction[] {
  const groups = new Map<string, StakingHistoryByPeriodAndAction>()

  for (const tx of transactions) {
    const date = new Date(txTimestamp(tx) * 1000)
    const period = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    const key = `${period}:${tx.action}`

    const existing = groups.get(key)
    if (existing) {
      existing.amount = (BigInt(existing.amount) + BigInt(tx.amount)).toString()
      existing.transactions.push(tx)
    } else {
      groups.set(key, {
        period,
        action: tx.action,
        amount: tx.amount,
        transactions: [tx],
      })
    }
  }

  return Array.from(groups.values())
}

/**
 * Loads staking history for an address from Blockscout ERC-20 Transfer logs (stRIF mint/burn style topics).
 * Used when the staking DB is unavailable. Results are grouped by UTC month and action like the DB path.
 *
 * @param address — Lowercase 0x-prefixed wallet address (already validated by the route).
 * @returns All period+action groups for the address (no pagination).
 * @throws If Blockscout responds with an error or unexpected payload.
 */
export async function fetchStakingHistoryFromBlockscout(
  address: string,
): Promise<StakingHistoryByPeriodAndAction[]> {
  const paddedUser = padAddress(address)

  const [stakeLogs, unstakeLogs] = await Promise.all([
    fetchAllLogs(buildLogParams(paddedUser, 'STAKE')),
    fetchAllLogs(buildLogParams(paddedUser, 'UNSTAKE')),
  ])

  const transactions: StakingHistoryTransaction[] = [
    ...stakeLogs.map(log => logToTransaction(log, 'STAKE', address)),
    ...unstakeLogs.map(log => logToTransaction(log, 'UNSTAKE', address)),
  ]

  transactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  return groupByPeriodAndAction(transactions)
}
