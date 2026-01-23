export interface VaultHistoryItem {
  action: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  period: string
  transactions: VaultHistoryTransaction[]
}

export interface VaultHistoryTransaction {
  action: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  shares: string
  blockNumber: string
  timestamp: number
  transactionHash: string
  user: string
  date: string
}
