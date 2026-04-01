import { applyActionTypeFilter } from '@/app/api/utils/helpers'
import { db } from '@/lib/db'
import type { StakingHistoryByPeriodAndAction, StakingHistoryDatabaseRow } from './types'

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

  // Whitelist to prevent SQL injection - only allow known safe values
  const orderDirection = sort_direction === 'asc' ? 'ASC' : 'DESC'

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
            ) ORDER BY timestamp ${orderDirection}
          ),
          '[]'::json
        )
      `),
    })
    .where(`user`, address)

  query = applyActionTypeFilter(query, type)

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

  query = applyActionTypeFilter(query, type)

  const result = await query.first()

  return Number(result?.count ?? 0)
}
