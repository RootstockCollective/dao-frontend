import type { Knex } from 'knex'
import { SORT_DIRECTION_ASC, SORT_DIRECTION_DESC } from './constants'
import { db } from '@/lib/db'

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

  // Detect whether query has a GROUP BY clause
  const hasGroupBy = queryHasGroupBy(baseQuery)

  // Build count query depending on whether GROUP BY exists
  const countQuery = hasGroupBy
    ? db.from(baseQuery.clone().as('subquery')).count<{ count: string }[]>('* as count').first()
    : baseQuery.clone().clearSelect().count<{ count: string }[]>('* as count').first()

  const dataQuery = baseQuery
    .clone()
    .modify(qb => {
      if (sortBy) {
        qb.orderBy(sortBy, sortDirection)
      }
    })
    .offset((page - 1) * pageSize)
    .limit(pageSize)

  const [countResult, data] = await Promise.all([countQuery, dataQuery])

  const count = parseInt(String(countResult?.count ?? 0), 10)

  return { data, count }
}

/**
 * Type-safe helper to detect if a Knex query includes GROUP BY.
 * It inspects the internal Knex query context safely without using `any`.
 */
function queryHasGroupBy<T extends {}>(query: Knex.QueryBuilder<T, T[]>): boolean {
  const internalQuery = query.toSQL()

  // Check if GROUP BY is present in the generated SQL string
  // (safe and avoids relying on private Knex internals)
  return /group by/i.test(internalQuery.sql)
}
