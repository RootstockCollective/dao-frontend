import { useQuery } from '@tanstack/react-query'

import { CycleRewardsItem } from '@/app/collective-rewards/types'
import { AVERAGE_BLOCKTIME, CYCLE_HISTORY_LIMIT } from '@/lib/constants'

export const useGetChartRewardsData = () => {
  const { data, isLoading, error } = useQuery<CycleRewardsItem[], Error>({
    queryFn: async (): Promise<CycleRewardsItem[]> => {
      const params = new URLSearchParams({
        sortBy: 'currentCycleStart',
        sortDirection: 'desc',
        // Shared with the per-cycle Backer counts so both reach back equally far.
        pageSize: String(CYCLE_HISTORY_LIMIT),
      })

      const response = await fetch(`/api/cycles?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch rewards chart data')
      }

      const result = await response.json()

      return result.data as CycleRewardsItem[]
    },
    queryKey: ['rewardsChartData'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return {
    data,
    isLoading,
    error,
  }
}
