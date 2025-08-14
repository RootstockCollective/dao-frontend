import type { Knex } from 'knex'

interface PaginateOptions<T> {
  page: number
  pageSize: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  allowedSortColumns?: string[]
}

export async function paginateQuery<T extends Record<string, unknown>>(
  baseQuery: Knex.QueryBuilder<T, T[]>,
  options: PaginateOptions<T>,
): Promise<{ data: T[]; count: number }> {
  const { page, pageSize, sortBy, sortDirection, allowedSortColumns } = options

  if (sortBy && !allowedSortColumns?.includes(sortBy)) {
    throw new Error(`Invalid sort column`)
  }

  const [countResult, data] = await Promise.all([
    baseQuery.clone().clearSelect().count().first(),
    baseQuery
      .clone()
      .modify(qb => {
        if (sortBy) qb.orderBy(sortBy, sortDirection)
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),
  ])

  const count = parseInt(String(countResult?.count ?? 0), 10)

  return { data, count }
}
