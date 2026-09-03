export type BtcVaultNavHistorySortField =
  | 'processedAt'
  | 'reportedOffchainAssets'
  | 'requestsProcessedInEpoch'

/** Mirrors validated GET `/api/btc-vault/v1/nav-history` query (state-sync / subgraph / Blockscout paging). */
export interface NavHistoryPagedParams {
  page: number
  limit: number
  sort_field: BtcVaultNavHistorySortField
  sort_direction: 'asc' | 'desc'
}

export interface BtcVaultNavDepositRequest {
  owner: string
  assets: string
}

export interface BtcVaultNavRedeemRequest {
  owner: string
  shares: string
}

export interface BtcVaultNavHistoryItem {
  id: string
  epochId: number
  reportedOffchainAssets: string
  processedAt: number
  requestsProcessedInEpoch: number
  blockNumber: number
  transactionHash: string
  deposits: BtcVaultNavDepositRequest[]
  redeems: BtcVaultNavRedeemRequest[]
}

export interface BtcVaultNavHistoryPageResult {
  data: BtcVaultNavHistoryItem[]
  total: number
}
