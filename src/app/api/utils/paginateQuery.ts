import type { Knex } from 'knex'
import { CastType } from '../types'

interface PaginateOptions {
  page: number
  pageSize: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  castedSortFieldsMap?: Record<string, CastType>
}

export async function paginateQuery<T extends Record<string, unknown>>(
  baseQuery: Knex.QueryBuilder<T, T[]>,
  options: PaginateOptions,
): Promise<{ data: T[]; count: number }> {
  const { page, pageSize, sortBy, sortDirection, castedSortFieldsMap = {} } = options

  const [countResult, data] = await Promise.all([
    baseQuery.clone().clearSelect().count().first(),
    baseQuery
      .clone()
      .modify(qb => {
        if (sortBy) {
          const castType = castedSortFieldsMap[sortBy]

          if (castType) {
            qb.orderByRaw(`CAST(?? AS ${castType}) ${sortDirection}`, [sortBy])
          } else {
            qb.orderBy(sortBy, sortDirection)
          }
        }
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),
  ])

  const count = parseInt(String(countResult?.count ?? 0), 10)

  return { data, count }
}
