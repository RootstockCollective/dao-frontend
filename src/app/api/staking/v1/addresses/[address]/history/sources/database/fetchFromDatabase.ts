import { applyActionTypeFilter } from '@/app/api/utils/helpers'
import { db } from '@/lib/db'

import type { StakingHistoryByPeriodAndAction, StakingHistoryDatabaseRow } from '../../types'

/**
 * Retrieves staking history from the database grouped by period and action.
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
 * Counts distinct period+action combinations for an address in the staking DB.
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
