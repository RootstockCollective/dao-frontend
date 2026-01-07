import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import Big from 'big.js'
import { AbiData, useGetABI } from './useGetABI'
import { useStateSyncHealthCheck } from './useStateSyncHealthCheck'

export const useGetMetricsAbiWithStateSync = () => {
  const {
    data: isStateSyncHealthy,
    isLoading: healthCheckIsLoading,
    error: healthCheckError,
  } = useStateSyncHealthCheck({
    initialData: true,
  })

  const {
    data: abiData,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  } = useQuery<AbiData, Error>({
    queryFn: async () => {
      const response = await fetch('/api/metrics/abi/context')
      if (!response.ok) {
        // TODO: propagate server errors
        throw new Error('Failed to fetch ABI data')
      }
      return response.json()
    },
    queryKey: ['abiData'],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !healthCheckIsLoading && isStateSyncHealthy,
  })

  const data = useGetABI(abiData)

  const unhealthyStateSyncError =
    (!healthCheckIsLoading && !isStateSyncHealthy && new Error('Unhealthy state sync')) || null

  return {
    data: isStateSyncHealthy ? data : Big(0),
    isLoading: healthCheckIsLoading || abiDataIsLoading,
    error: healthCheckError || abiDataError || unhealthyStateSyncError,
  }
}
