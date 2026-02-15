import { sentryServer } from '@/lib/sentry/sentry-server'

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

/**
 * Handles API errors with detailed information in development mode
 */
export const handleApiError = (err: unknown, context?: string): Response => {
  if (context) {
    console.error(`Error in ${context}:`, err)
  } else {
    console.error(err)
  }

  const errorMessage = err instanceof Error ? err.message : String(err)
  const errorStack = err instanceof Error ? err.stack : undefined
  const errorName = err instanceof Error ? err.name : 'UnknownError'

  const error = err instanceof Error ? err : new Error(errorMessage)
  sentryServer.captureException(error, {
    tags: {
      errorType: 'API_ERROR',
      context: context || 'unknown',
    },
    extra: {
      errorName,
      errorMessage,
      errorStack,
    },
  })

  return Response.json(
    {
      error: 'Internal server error',
      message: errorMessage,
      name: errorName,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
    },
    { status: 500 },
  )
}
