import type { HealthCheckResult } from '@/app/api/health/healthCheck.utils'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

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
        // TODO: propagate server errors
        throw new Error('Failed to fetch health check data')
      }

      try {
        return response.json()
      } catch (error) {
        console.error('Error parsing health check response:', error)

        throw new Error('Invalid health check data')
      }
    },
    refetchInterval: AVERAGE_BLOCKTIME,
    ...options,
    queryKey: ['healthCheck'],
  })
