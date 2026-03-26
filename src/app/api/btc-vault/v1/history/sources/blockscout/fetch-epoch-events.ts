import { decodeEventLog, getAbiItem, type Hex, toEventSelector } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'

import type { BtcVaultHistoryItem } from '../../types'
import { toUnixSeconds } from './decode-logs'
import { fetchVaultLogsAllPagesForTopic } from './fetch-logs'
import type { EpochEventInfo } from './types'

/**
 * Fetches all `EpochSettled` logs from Blockscout and returns a map keyed by epochId string.
 */
export async function fetchEpochSettledMap(
  blockscoutBaseUrl: string,
  vaultAddressLower: string,
): Promise<Map<string, EpochEventInfo>> {
  const topic0 = toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochSettled' }))
  const rawLogs = await fetchVaultLogsAllPagesForTopic(blockscoutBaseUrl, vaultAddressLower, topic0)

  const map = new Map<string, EpochEventInfo>()
  for (const item of rawLogs) {
    const topics = item.topics
    const data = item.data
    if (!topics?.length || !data) continue

    try {
      const decoded = decodeEventLog({
        abi: RBTCAsyncVaultAbi,
        data: data as Hex,
        topics: topics as [Hex, ...Hex[]],
      })
      if (decoded.eventName !== 'EpochSettled') continue

      const txHash = item.tx_hash?.startsWith('0x') ? item.tx_hash : `0x${item.tx_hash ?? ''}`
      const blockNum =
        typeof item.block_number === 'number' ? item.block_number : Number(item.block_number ?? 0)
      const blockNumber = Number.isFinite(blockNum) ? String(blockNum) : '0'
      const timestamp = toUnixSeconds(item, blockNum)
      const epochId = String(decoded.args.epochId)

      map.set(epochId, { epochId, timestamp, blockNumber, transactionHash: txHash })
    } catch {
      // skip logs that fail to decode
    }
  }
  return map
}

/**
 * Fetches all `EpochFundingProgress` logs from Blockscout and returns a map keyed by epochId string.
 * When multiple FundingProgress events exist for the same epochId, the one with `claimable=true`
 * takes precedence.
 */
export async function fetchEpochFundingProgressMap(
  blockscoutBaseUrl: string,
  vaultAddressLower: string,
): Promise<Map<string, EpochEventInfo>> {
  const topic0 = toEventSelector(getAbiItem({ abi: RBTCAsyncVaultAbi, name: 'EpochFundingProgress' }))
  const rawLogs = await fetchVaultLogsAllPagesForTopic(blockscoutBaseUrl, vaultAddressLower, topic0)

  const map = new Map<string, EpochEventInfo>()
  for (const item of rawLogs) {
    const topics = item.topics
    const data = item.data
    if (!topics?.length || !data) continue

    try {
      const decoded = decodeEventLog({
        abi: RBTCAsyncVaultAbi,
        data: data as Hex,
        topics: topics as [Hex, ...Hex[]],
      })
      if (decoded.eventName !== 'EpochFundingProgress') continue

      const txHash = item.tx_hash?.startsWith('0x') ? item.tx_hash : `0x${item.tx_hash ?? ''}`
      const blockNum =
        typeof item.block_number === 'number' ? item.block_number : Number(item.block_number ?? 0)
      const blockNumber = Number.isFinite(blockNum) ? String(blockNum) : '0'
      const timestamp = toUnixSeconds(item, blockNum)
      const epochId = String(decoded.args.epochId)

      const existing = map.get(epochId)
      if (!existing || decoded.args.claimable) {
        map.set(epochId, {
          epochId,
          timestamp,
          blockNumber,
          transactionHash: txHash,
          claimable: decoded.args.claimable,
        })
      }
    } catch {
      // skip logs that fail to decode
    }
  }
  return map
}

/**
 * Promotes `action` on each request row in-place to match subgraph `btcVaultHistory` semantics
 * when epoch events exist. Skips cancelled request ids. **`id` / `transactionHash` stay on the
 * original request** (stable keys); only **`action`** changes.
 *
 * - DEPOSIT_REQUEST + EpochSettled(epochId) → DEPOSIT_CLAIMABLE
 * - REDEEM_REQUEST + EpochSettled → REDEEM_ACCEPTED; if EpochFundingProgress(epochId).claimable → REDEEM_CLAIMABLE
 *
 * The API uses this path instead of {@link synthesizeIntermediateRows}, which emits **extra**
 * synthetic rows per transition.
 */
export function promoteRequestActionsFromEpochMaps(
  requestRows: BtcVaultHistoryItem[],
  epochSettledMap: Map<string, EpochEventInfo>,
  epochFundingMap: Map<string, EpochEventInfo>,
  cancelledIds: Set<string>,
): BtcVaultHistoryItem[] {
  return requestRows.map(row => {
    if (cancelledIds.has(row.id)) {
      return row
    }

    if (row.action === 'DEPOSIT_REQUEST') {
      if (epochSettledMap.has(row.epochId)) {
        return { ...row, action: 'DEPOSIT_CLAIMABLE' }
      }
      return row
    }

    if (row.action === 'REDEEM_REQUEST') {
      let action = row.action
      if (epochSettledMap.has(row.epochId)) {
        action = 'REDEEM_ACCEPTED'
      }
      if (action === 'REDEEM_ACCEPTED' && epochFundingMap.get(row.epochId)?.claimable) {
        action = 'REDEEM_CLAIMABLE'
      }
      return action === row.action ? row : { ...row, action }
    }

    return row
  })
}

/**
 * Synthesizes intermediate history rows (DEPOSIT_CLAIMABLE, REDEEM_ACCEPTED, REDEEM_CLAIMABLE)
 * by cross-referencing request rows with epoch event maps.
 *
 * - DEPOSIT_REQUEST + EpochSettled -> DEPOSIT_CLAIMABLE
 * - REDEEM_REQUEST + EpochSettled -> REDEEM_ACCEPTED
 * - REDEEM_REQUEST + EpochFundingProgress(claimable=true) -> REDEEM_CLAIMABLE
 *
 * Synthetic rows inherit user/assets/shares/epochId from the request row and
 * timestamp/blockNumber/transactionHash from the epoch event.
 *
 * @deprecated Not used by the history API — prefer {@link promoteRequestActionsFromEpochMaps}
 * for in-place `action` promotion (single row per request).
 */
export function synthesizeIntermediateRows(
  requestRows: BtcVaultHistoryItem[],
  epochSettledMap: Map<string, EpochEventInfo>,
  epochFundingMap: Map<string, EpochEventInfo>,
): BtcVaultHistoryItem[] {
  const synthetic: BtcVaultHistoryItem[] = []

  for (const row of requestRows) {
    if (row.action === 'DEPOSIT_REQUEST') {
      const settled = epochSettledMap.get(row.epochId)
      if (settled) {
        synthetic.push({
          id: `${settled.transactionHash}-${row.transactionHash}-${row.user}-DEPOSIT_CLAIMABLE`,
          user: row.user,
          action: 'DEPOSIT_CLAIMABLE',
          assets: row.assets,
          shares: row.shares,
          epochId: row.epochId,
          timestamp: settled.timestamp,
          blockNumber: settled.blockNumber,
          transactionHash: settled.transactionHash,
        })
      }
    } else if (row.action === 'REDEEM_REQUEST') {
      const settled = epochSettledMap.get(row.epochId)
      if (settled) {
        synthetic.push({
          id: `${settled.transactionHash}-${row.transactionHash}-${row.user}-REDEEM_ACCEPTED`,
          user: row.user,
          action: 'REDEEM_ACCEPTED',
          assets: row.assets,
          shares: row.shares,
          epochId: row.epochId,
          timestamp: settled.timestamp,
          blockNumber: settled.blockNumber,
          transactionHash: settled.transactionHash,
        })
      }

      const funding = epochFundingMap.get(row.epochId)
      if (funding?.claimable) {
        synthetic.push({
          id: `${funding.transactionHash}-${row.transactionHash}-${row.user}-REDEEM_CLAIMABLE`,
          user: row.user,
          action: 'REDEEM_CLAIMABLE',
          assets: row.assets,
          shares: row.shares,
          epochId: row.epochId,
          timestamp: funding.timestamp,
          blockNumber: funding.blockNumber,
          transactionHash: funding.transactionHash,
        })
      }
    }
  }

  return synthetic
}
