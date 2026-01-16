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
  // AllocationHistory specific
  allocation?: string
  increased?: boolean
  // ClaimedRewardsHistory specific
  amount?: string
  rewardToken?: Address
  totalAmount?: string
}
