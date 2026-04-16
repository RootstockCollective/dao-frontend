export type BtcVaultNavHistorySortField = 'processedAt' | 'reportedOffchainAssets' | 'requestsProcessed'

export interface BtcVaultNavHistoryItem {
  id: string
  epochId: number
  reportedOffchainAssets: string
  processedAt: number
  requestsProcessed: number
  blockNumber: number
  transactionHash: string
}

export interface BtcVaultNavHistoryPageResult {
  data: BtcVaultNavHistoryItem[]
  total: number
}
