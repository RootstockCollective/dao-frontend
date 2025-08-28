import type { Knex } from 'knex'
import { SORT_DIRECTION_ASC, SORT_DIRECTION_DESC } from './constants'

interface PaginateOptions {
  page: number
  pageSize: number
  sortBy?: string
  sortDirection?: typeof SORT_DIRECTION_ASC | typeof SORT_DIRECTION_DESC
}

export async function paginateQuery<T extends Record<string, unknown>>(
  baseQuery: Knex.QueryBuilder<T, T[]>,
  options: PaginateOptions,
): Promise<{ data: T[]; count: number }> {
  const { page, pageSize, sortBy, sortDirection } = options

  const [countResult, data] = await Promise.all([
    baseQuery.clone().clearSelect().count().first(),
    baseQuery
      .clone()
      .modify(qb => {
        if (sortBy) {
          qb.orderBy(sortBy, sortDirection)
        }
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),
  ])

  const count = parseInt(String(countResult?.count ?? 0), 10)

  return { data, count }
}
