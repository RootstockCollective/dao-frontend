/** Display status for history rows (Ready to claim / Ready to withdraw from request status). */
export type BtcVaultHistoryDisplayStatus =
  | 'ready_to_claim'
  | 'pending'
  | 'ready_to_withdraw'
  | 'approved'
  | 'successful'
  | 'cancelled'
  | 'rejected'

export interface BtcVaultHistoryItem {
  id: string
  user: string
  action: string
  assets: string
  shares: string
  epochId: string
  timestamp: number
  blockNumber: string
  transactionHash: string
}

export interface BtcVaultHistoryItemWithStatus extends BtcVaultHistoryItem {
  /** Set for each row; from request status for *_REQUEST, derived from action for CLAIMED/CANCELLED. */
  displayStatus?: BtcVaultHistoryDisplayStatus
}

/** Query shape shared by subgraph and Blockscout history sources. */
export interface BtcVaultHistoryQueryParams {
  limit: number
  page: number
  sort_field: 'timestamp' | 'assets'
  sort_direction: 'asc' | 'desc'
  type?: string[]
  address?: string
}
