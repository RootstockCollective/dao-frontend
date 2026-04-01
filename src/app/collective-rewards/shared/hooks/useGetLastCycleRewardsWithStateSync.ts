import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { CycleData } from './useGetABI'
import { useStateSyncHealthCheck } from './useStateSyncHealthCheck'

export const useGetLastCycleRewardsWithStateSync = () => {
  const {
    data: isStateSyncHealthy,
    isLoading: healthCheckIsLoading,
    error: healthCheckError,
  } = useStateSyncHealthCheck({
    initialData: true,
  })

  const {
    data: lastCycleRewards,
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useQuery<CycleData[], Error>({
    queryFn: async () => {
      const response = await fetch('/api/cycles?sortBy=currentCycleStart&sortDirection=desc&pageSize=1')
      if (!response.ok) {
        throw new Error('Failed to fetch last cycle rewards')
      }
      const result = await response.json()
      return result.data as CycleData[]
    },
    queryKey: ['lastCycleRewardsWithStateSync'],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !healthCheckIsLoading && isStateSyncHealthy,
  })

  const unhealthyStateSyncError =
    (!healthCheckIsLoading && !isStateSyncHealthy && new Error('Unhealthy state sync')) || null

  const error = healthCheckError || unhealthyStateSyncError || lastCycleRewardsError
  const isLoading = healthCheckIsLoading || lastCycleRewardsLoading

  return { data: lastCycleRewards, isLoading, error }
}
