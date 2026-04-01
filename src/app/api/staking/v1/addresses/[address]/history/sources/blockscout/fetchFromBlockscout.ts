import type { Hex } from 'viem'

import {
  type BlockscoutGetLogsQuery,
  fetchBlockscoutGetLogsPaginated,
} from '@/lib/blockscout/fetchBlockscoutGetLogsPaginated'
import { STRIF_ADDRESS } from '@/lib/constants'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import type { StakingAction, StakingHistoryByPeriodAndAction, StakingHistoryTransaction } from '../../types'
import { txTimestamp } from '../shared/query'

/** ERC-20 `Transfer(address,address,uint256)` topic0. */
const TRANSFER_TOPIC0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as Hex
/** 32-byte zero topic used for mint/burn-style `Transfer` filters on stRIF. */
const ZERO_TOPIC = '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex

/**
 * Pads a 20-byte `0x` address to a 32-byte log topic (64 hex digits after `0x`), as required by indexed `Transfer` args.
 *
 * @param address — Normalized 42-char EVM address (validated upstream).
 */
function padAddress(address: string): string {
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`
}

/**
 * Builds a Blockscout `getLogs` query for stRIF `Transfer` logs via {@link STRIF_ADDRESS}:
 * mint-style stake (`topic1` zero, `topic2` user) vs burn-style unstake (`topic1` user, `topic2` zero).
 *
 * @param paddedUser — 32-byte topic form of the wallet (see {@link padAddress}).
 * @param action — `STAKE` or `UNSTAKE` selects which indexed slot holds the user.
 */
function buildStakingTransferLogQuery(paddedUser: string, action: StakingAction): BlockscoutGetLogsQuery {
  const isStake = action === 'STAKE'
  const userTopic = paddedUser as Hex
  return {
    address: STRIF_ADDRESS,
    topic0: TRANSFER_TOPIC0,
    topic1: isStake ? ZERO_TOPIC : userTopic,
    topic2: isStake ? userTopic : ZERO_TOPIC,
    topic0_1_opr: 'and',
    topic0_2_opr: 'and',
    topic1_2_opr: 'and',
  }
}

/**
 * Loads all paginated logs for one action from Blockscout (60s Next.js revalidate).
 *
 * @see {@link fetchBlockscoutGetLogsPaginated}
 */
async function fetchStakingTransferLogs(
  paddedUser: string,
  action: StakingAction,
): Promise<BackendEventByTopic0ResponseValue[]> {
  return fetchBlockscoutGetLogsPaginated({
    query: buildStakingTransferLogQuery(paddedUser, action),
    fetchInit: { next: { revalidate: 60 } },
  })
}

/**
 * Maps one Blockscout row to {@link StakingHistoryTransaction}: `data` is the transfer value (wei as hex),
 * `timeStamp` and `blockNumber` are parsed as hex, `blockHash` is unset (explorer row has no usable hash here).
 */
function logToTransaction(
  log: BackendEventByTopic0ResponseValue,
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

/**
 * Groups transactions by `YYYY-MM` (UTC) and {@link StakingAction}, summing `amount` and appending to `transactions`
 * (same aggregate shape as the database staking history source).
 *
 * @returns Groups in `Map` insertion order (first seen period+action first); sort client-side if a stable order is required.
 */
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
 * Loads staking history for an address from Blockscout stRIF `Transfer` logs (mint/burn topic pattern).
 * Used when the staking DB is unavailable (DAO-2058). Output matches the DB source: UTC monthly buckets per action.
 *
 * @param address — Lowercase `0x`-prefixed wallet (validated by the API route).
 * @returns All period+action groups for the wallet (full history; caller paginates if needed).
 *
 * @see {@link fetchBlockscoutGetLogsPaginated} — Shared pagination, dedupe, and error handling.
 *
 * @throws Propagates Blockscout client errors (HTTP failure, `status !== '1'`, missing `result`).
 */
export async function fetchStakingHistoryFromBlockscout(
  address: string,
): Promise<StakingHistoryByPeriodAndAction[]> {
  const paddedUser = padAddress(address)

  const [stakeLogs, unstakeLogs] = await Promise.all([
    fetchStakingTransferLogs(paddedUser, 'STAKE'),
    fetchStakingTransferLogs(paddedUser, 'UNSTAKE'),
  ])

  const transactions: StakingHistoryTransaction[] = [
    ...stakeLogs.map(log => logToTransaction(log, 'STAKE', address)),
    ...unstakeLogs.map(log => logToTransaction(log, 'UNSTAKE', address)),
  ]

  transactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  return groupByPeriodAndAction(transactions)
}
