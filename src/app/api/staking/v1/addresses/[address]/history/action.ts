import { db } from '@/lib/db'

/**
 * Represents a single staking transaction from the history
 */
export interface StakingHistoryTransaction {
  /** User address (wallet address) that performed the transaction */
  user: string
  /** Action type: "STAKE" or "UNSTAKE" */
  action: string
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
  action: string
  /** Sum of all amounts for transactions in this period+action group (as string to handle large numbers) */
  amount: string
  /** Array of individual transactions in this group */
  transactions: StakingHistoryTransaction[]
}

/**
 * Represents a raw database row from the staking history query before transformation
 */
interface StakingHistoryDatabaseRow {
  /** Period in format "YYYY-MM" (e.g., "2024-01") */
  period: string
  /** Action type: "STAKE" or "UNSTAKE" */
  action: string
  /** Sum of all amounts for transactions in this period+action group (may be null if no rows to sum) */
  amount: number | bigint | null
  /** Array of individual transactions in this group (always an array due to COALESCE) */
  transactions: StakingHistoryTransaction[]
}

/**
 * Retrieves staking history from the database grouped by period and action
 * @param params - Query parameters
 * @param params.address - User wallet address to filter transactions
 * @param params.limit - Maximum number of records to return
 * @param params.offset - Number of records to skip (for pagination)
 * @param params.sort_field - Field to sort by: 'period', 'amount', or 'action'
 * @param params.sort_direction - Sort direction: 'asc' (ascending) or 'desc' (descending)
 * @param params.type - Optional array of action types to filter by: 'stake' or 'unstake'
 * @returns Array of staking history grouped by period and action
 */
export async function getStakingHistoryFromDB(params: {
  address: string
  limit: number
  offset: number
  sort_field: 'period' | 'amount' | 'action'
  sort_direction: 'asc' | 'desc'
  type?: ('stake' | 'unstake')[]
}): Promise<StakingHistoryByPeriodAndAction[]> {
  const { address, limit, offset, sort_field, sort_direction, type } = params

  let query = db('StakingHistory')
    .select(
      db.raw(`
        TO_CHAR(DATE_TRUNC('month', to_timestamp(timestamp)), 'YYYY-MM') as period
      `),
      'action',
    )
    .select({
      amount: db.raw(`SUM(amount)`),
      transactions: db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'user', convert_from("user", 'utf8'),
              'action', action,
              'amount', amount::text,
              'blockNumber', "blockNumber"::text,
              'blockHash', NULL,
              'timestamp', timestamp,
              'transactionHash', convert_from("transactionHash", 'utf8')
            ) ORDER BY timestamp ${sort_direction.toUpperCase()}
          ),
          '[]'::json
        )
      `),
    })
    .where(`user`, address)

  // Apply type filter if provided
  if (type && type.length > 0) {
    // Convert 'stake'/'unstake' to 'STAKE'/'UNSTAKE' (uppercase) to match DB values
    const upperCaseTypes = type.map(t => t.toUpperCase())
    query = query.whereIn('action', upperCaseTypes)
  }

  const result = await query
    .groupByRaw(`DATE_TRUNC('month', to_timestamp(timestamp)), "action"`)
    .orderBy(sort_field, sort_direction)
    .limit(limit)
    .offset(offset)

  return result.map((row: StakingHistoryDatabaseRow) => ({
    period: row.period,
    action: row.action,
    amount: String(row.amount || 0),
    transactions: row.transactions || [],
  }))
}

/**
 * Counts the total number of distinct period+action combinations for a given address
 * @param address - User wallet address to count transactions for
 * @param type - Optional array of action types to filter by: 'stake' or 'unstake'
 * @returns Total count of distinct period+action combinations
 */
export async function getStakingHistoryCountFromDB(
  address: string,
  type?: ('stake' | 'unstake')[],
): Promise<number> {
  let query = db('StakingHistory')
    .count({ count: db.raw(`DISTINCT (DATE_TRUNC('month', to_timestamp(timestamp)), "action")`) })
    .where(`user`, address)

  // Apply type filter if provided
  if (type && type.length > 0) {
    // Convert 'stake'/'unstake' to 'STAKE'/'UNSTAKE' (uppercase) to match DB values
    const upperCaseTypes = type.map(t => t.toUpperCase())
    query = query.whereIn('action', upperCaseTypes)
  }

  const result = await query.first()

  return Number(result?.count ?? 0)
}
