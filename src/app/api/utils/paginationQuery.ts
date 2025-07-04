import type { Knex } from 'knex'

export async function paginateQuery<T = any>(
  baseQuery: Knex.QueryBuilder,
  page: number,
  pageSize: number,
): Promise<{ data: T[]; count: number }> {
  const [countResult, data] = await Promise.all([
    baseQuery.clone().count().first(),
    baseQuery
      .clone()
      .select('*')
      .offset((page - 1) * pageSize)
      .limit(pageSize),
  ])

  const count = parseInt(String(countResult?.count ?? 0), 10)
  return { data, count }
}
