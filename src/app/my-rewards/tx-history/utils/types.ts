import { Address } from 'viem'

export type TransactionHistoryType = 'Back' | 'Claim'

export interface TransactionHistoryItem {
  type: TransactionHistoryType
  id: string
  backer: Address
  builder: Address
  blockHash: string
  blockTimestamp: string
  transactionHash: string
  cycleStart: string
  // Combined amount field (allocation for Back, amount for Claim)
  amount?: string
  increased?: boolean
  // ClaimedRewardsHistory specific
  rewardToken?: Address
}
