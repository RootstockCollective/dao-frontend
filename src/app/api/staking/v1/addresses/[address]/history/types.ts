export type StakingAction = 'STAKE' | 'UNSTAKE'

/**
 * Represents a single staking transaction from the history
 */
export interface StakingHistoryTransaction {
  /** User address (wallet address) that performed the transaction */
  user: string
  /** Action type: "STAKE" or "UNSTAKE" */
  action: StakingAction
  /** Amount of tokens involved in the transaction (as string to handle large numbers) */
  amount: string
  /** Block number at which the transaction occurred */
  blockNumber: string
  /** Block hash at which the transaction occurred (may be null if not available) */
  blockHash: string | null
  /** Unix timestamp (in seconds) when the transaction occurred */
  timestamp: number | string
  /** Transaction hash identifier */
  transactionHash: string
}

/**
 * Represents staking history grouped by period (month) and action type
 */
export interface StakingHistoryByPeriodAndAction {
  /** Period in format "YYYY-MM" (e.g., "2024-01") */
  period: string
  /** Action type: "STAKE" or "UNSTAKE" */
  action: StakingAction
  /** Sum of all amounts for transactions in this period+action group (as string to handle large numbers) */
  amount: string
  /** Array of individual transactions in this group */
  transactions: StakingHistoryTransaction[]
}

/**
 * Represents a raw database row from the staking history query before transformation
 * @internal Used internally by action.ts
 */
export interface StakingHistoryDatabaseRow {
  /** Period in format "YYYY-MM" (e.g., "2024-01") */
  period: string
  /** Action type: "STAKE" or "UNSTAKE" */
  action: StakingAction
  /** Sum of all amounts for transactions in this period+action group (may be null if no rows to sum) */
  amount: number | bigint | null
  /** Array of individual transactions in this group (always an array due to COALESCE) */
  transactions: StakingHistoryTransaction[]
}
