export interface StakingHistoryItem {
  action: 'STAKE' | 'UNSTAKE'
  amount: string
  period: string
  transactions: StakingHistoryTransaction[]
}

export interface StakingHistoryTransaction {
  action: 'STAKE' | 'UNSTAKE'
  amount: string
  blockNumber: string
  timestamp: number
  transactionHash: string
  user: string
  date: string
  total_amount?: string
}
