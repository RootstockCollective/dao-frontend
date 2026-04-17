export type BtcVaultNavHistorySortField = 'processedAt' | 'reportedOffchainAssets' | 'requestsProcessed'

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
  requestsProcessed: number
  blockNumber: number
  transactionHash: string
  deposits: BtcVaultNavDepositRequest[]
  redeems: BtcVaultNavRedeemRequest[]
}

export interface BtcVaultNavHistoryPageResult {
  data: BtcVaultNavHistoryItem[]
  total: number
}
