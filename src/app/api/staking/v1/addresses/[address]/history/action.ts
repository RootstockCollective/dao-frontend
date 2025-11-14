import { db } from '@/lib/db'

export type StakingHistoryTransaction = {
  user: string
  action: string
  amount: string
  blockNumber: string
  timestamp: number | string
  transactionHash: string
}

export type StakingHistoryByPeriodAndAction = {
  period: string
  action: string
  amount: string
  transactions: StakingHistoryTransaction[]
}

export async function getStakingHistoryFromDB(params: {
  address: string
  limit: number
  offset: number
  sort_field: 'period' | 'amount' | 'action'
  sort_direction: 'asc' | 'desc'
}): Promise<StakingHistoryByPeriodAndAction[]> {
  const { address, limit, offset, sort_field, sort_direction } = params

  const result = await db('StakingHistory')
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
              'timestamp', timestamp,
              'transactionHash', convert_from("transactionHash", 'utf8')
            ) ORDER BY timestamp ${sort_direction.toUpperCase()}
          ),
          '[]'::json
        )
      `),
    })
    .where(`user`, address)
    .groupByRaw(`DATE_TRUNC('month', to_timestamp(timestamp)), "action"`)
    .orderBy(sort_field, sort_direction)
    .limit(limit)
    .offset(offset)

  return result.map((row: any) => ({
    period: row.period,
    action: row.action,
    amount: String(row.amount || 0),
    transactions: row.transactions || [],
  }))
}

export async function getStakingHistoryCountFromDB(address: string): Promise<number> {
  const result = await db('StakingHistory')
    .count({ count: db.raw(`DISTINCT (DATE_TRUNC('month', to_timestamp(timestamp)), "action")`) })
    .where(`user`, address)
    .first()

  return Number(result?.count ?? 0)
}
