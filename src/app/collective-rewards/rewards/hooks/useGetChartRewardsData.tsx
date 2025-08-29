import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { CycleRewardsItem } from '@/app/collective-rewards/types'

export const useGetChartRewardsData = () => {
  const { data, isLoading, error } = useQuery<CycleRewardsItem[], Error>({
    queryFn: async (): Promise<CycleRewardsItem[]> => {
      const response = await fetch(`/api/cycles`)

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
