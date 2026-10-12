import { randomUUID } from 'crypto'

import { logger } from '@/lib/logger'

const log = logger.child({ module: 'api' })

export const queryParam = (searchParams: URLSearchParams) => (key: string) => {
  const v = searchParams.get(key)
  return v === null || v === '' ? undefined : v
}

/**
 * Applies action type filter to a Knex query, converting types to uppercase
 */
export const applyActionTypeFilter = <
  Q extends { whereIn: (column: string, values: string[]) => Q },
  T extends string,
>(
  query: Q,
  types: T[] | undefined,
): Q => {
  if (types && types.length > 0) {
    return query.whereIn(
      'action',
      types.map(t => t.toUpperCase()),
    )
  }
  return query
}

/** Returns the id the error was logged under, for the client to quote. */
export const logApiError = (err: unknown, context?: string, fields?: Record<string, unknown>): string => {
  const errorId = randomUUID()
  log.error({ ...fields, err, context, errorId }, context ? `Error in ${context}` : 'API error')
  return errorId
}

export const handleApiError = (err: unknown, context?: string, fields?: Record<string, unknown>): Response =>
  Response.json(
    { success: false, error: 'Internal server error', errorId: logApiError(err, context, fields) },
    { status: 500 },
  )
