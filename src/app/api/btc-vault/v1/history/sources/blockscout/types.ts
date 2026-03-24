import { type BackendEventByTopic0ResponseValue } from '@/shared/utils'

import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus } from '../../types'

export interface BlockscoutLogItem {
  tx_hash?: string
  index?: number
  data?: string
  topics?: string[]
  block_number?: number | string
  /** Unix timestamp in seconds (string or number), when exposed by Blockscout. */
  block_timestamp?: number | string
  timestamp?: number | string
}

/** Blockscout `/api?module=logs&action=getLogs` JSON shape (epoch-history uses the same endpoint). */
export interface BlockscoutRpcLogsResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[] | null
}

/** Decoded epoch event metadata for cross-referencing with request rows. */
export interface EpochEventInfo {
  epochId: string
  timestamp: number
  blockNumber: string
  transactionHash: string
  /** Only set for EpochFundingProgress events. */
  claimable?: boolean
}

export interface GetFromBlockscoutSourceOptions {
  /** Used when RPC status enrichment fails. */
  mapActionOnly: (item: BtcVaultHistoryItem) => BtcVaultHistoryItemWithStatus
}
