import { decodeEventLog, type DecodeEventLogReturnType, type Hex } from 'viem'

import { RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault/RBTCAsyncVaultAbi'
import { type BackendEventByTopic0ResponseValue } from '@/shared/utils'

import type { BtcVaultHistoryItem } from '../../types'
import type { BlockscoutLogItem } from './types'
import { normalizeAddress } from './utils'

export function rpcGetLogToBlockscoutLogItem(log: BackendEventByTopic0ResponseValue): BlockscoutLogItem {
  const topics = log.topics.filter((t): t is string => t !== null)
  const blockNumberHex = log.blockNumber
  const blockNumberDecimal = blockNumberHex.startsWith('0x')
    ? parseInt(blockNumberHex, 16)
    : Number(blockNumberHex)
  const logIndexHex = log.logIndex
  const logIndexDecimal = logIndexHex.startsWith('0x') ? parseInt(logIndexHex, 16) : Number(logIndexHex)

  return {
    tx_hash: log.transactionHash.startsWith('0x') ? log.transactionHash : `0x${log.transactionHash}`,
    data: log.data,
    topics,
    block_number: Number.isFinite(blockNumberDecimal) ? blockNumberDecimal : 0,
    index: Number.isFinite(logIndexDecimal) ? logIndexDecimal : 0,
    timestamp: log.timeStamp ? Number(log.timeStamp) : undefined,
  }
}

export function toUnixSeconds(item: BlockscoutLogItem, blockNumber: number): number {
  const raw = item.block_timestamp ?? item.timestamp
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = typeof raw === 'string' ? Number(raw) : raw
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  return blockNumber > 0 ? blockNumber : 0
}

export function historyId(txHash: string, logIndex: number): string {
  return `${txHash}-${logIndex}`
}

type DecodedVaultEvent = DecodeEventLogReturnType<typeof RBTCAsyncVaultAbi>

/**
 * Maps a decoded vault event to `BtcVaultHistoryItem`, or `null` if the event is not part of user history.
 *
 * `user` must match the subgraph `BtcVaultHistory.user` field: **`controller`**, not owner/receiver
 * (see `rootstockvaults-usdvault` `createBtcVaultHistory` / `requestEntityId(controller, epochId)`).
 */
export function mapDecodedVaultLogToHistoryItem(
  decoded: DecodedVaultEvent,
  context: { txHash: string; logIndex: number; blockNumber: string; timestamp: number },
): BtcVaultHistoryItem | null {
  const { txHash, logIndex, blockNumber, timestamp } = context
  const id = historyId(txHash, logIndex)

  switch (decoded.eventName) {
    case 'DepositRequested': {
      const { owner, epochId, assets } = decoded.args
      return {
        id,
        user: normalizeAddress(owner),
        action: 'DEPOSIT_REQUEST',
        assets: String(assets),
        shares: '0',
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'DepositClaimed': {
      const { caller, epochId, assets, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(caller),
        action: 'DEPOSIT_CLAIMED',
        assets: String(assets),
        shares: String(shares),
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'DepositRequestCancelled': {
      const { owner, epochId, assets } = decoded.args
      return {
        id,
        user: normalizeAddress(owner),
        action: 'DEPOSIT_CANCELLED',
        assets: String(assets),
        shares: '0',
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'RedeemRequest': {
      const { owner, epochId, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(owner),
        action: 'REDEEM_REQUEST',
        assets: '0',
        shares: String(shares),
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'RedeemClaimed': {
      const { caller, epochId, assets, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(caller),
        action: 'REDEEM_CLAIMED',
        assets: String(assets),
        shares: String(shares),
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    case 'RedeemRequestCancelled': {
      const { owner, epochId, shares } = decoded.args
      return {
        id,
        user: normalizeAddress(owner),
        action: 'REDEEM_CANCELLED',
        assets: '0',
        shares: String(shares),
        epochId: String(epochId),
        timestamp,
        blockNumber,
        transactionHash: txHash,
      }
    }
    default:
      return null
  }
}

export function tryDecodeLog(item: BlockscoutLogItem): BtcVaultHistoryItem | null {
  const topics = item.topics
  const data = item.data
  const txHash = item.tx_hash?.startsWith('0x') ? item.tx_hash : `0x${item.tx_hash ?? ''}`
  if (!topics?.length || !data || !txHash || txHash.length < 10) return null

  const logIndex = typeof item.index === 'number' ? item.index : Number(item.index ?? 0)
  const blockNum = typeof item.block_number === 'number' ? item.block_number : Number(item.block_number ?? 0)
  const blockNumber = Number.isFinite(blockNum) ? String(blockNum) : '0'
  const timestamp = toUnixSeconds(item, blockNum)

  try {
    const decoded = decodeEventLog({
      abi: RBTCAsyncVaultAbi,
      data: data as Hex,
      topics: topics as [Hex, ...Hex[]],
    })
    return mapDecodedVaultLogToHistoryItem(decoded, {
      txHash,
      logIndex: Number.isFinite(logIndex) ? logIndex : 0,
      blockNumber,
      timestamp,
    })
  } catch {
    return null
  }
}
