import type { HealthCheckResult } from '@/app/api/health/healthCheck.utils'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { sentryClient } from '@/lib/sentry/sentry-client'

export const useStateSyncHealthCheck = (
  options?: Omit<UseQueryOptions<HealthCheckResult, Error>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<HealthCheckResult, Error>({
    queryFn: async (): Promise<HealthCheckResult> => {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const fetchError = new Error('Failed to fetch health check data')
        sentryClient.captureException(fetchError, {
          tags: {
            errorType: 'HEALTH_CHECK_FETCH_ERROR',
          },
          extra: {
            status: response.status,
          },
        })
        throw fetchError
      }

      try {
        return response.json()
      } catch (error) {
        console.error('Error parsing health check response:', error)
        const parseError = error instanceof Error ? error : new Error('Invalid health check data')
        sentryClient.captureException(parseError, {
          tags: {
            errorType: 'HEALTH_CHECK_PARSE_ERROR',
          },
        })
        throw new Error('Invalid health check data')
      }
    },
    refetchInterval: AVERAGE_BLOCKTIME,
    ...options,
    queryKey: ['healthCheck'],
  })
