import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { DailyAllocationItem } from '@/app/collective-rewards/types'

export const useGetChartBackingData = () => {
  const { data, isLoading, error } = useQuery<DailyAllocationItem[], Error>({
    queryFn: async (): Promise<DailyAllocationItem[]> => {
      const response = await fetch(`/api/allocations/daily`)

      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }

      const result = await response.json()

      return result.data as DailyAllocationItem[]
    },
    queryKey: ['backingChartData'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return {
    data,
    isLoading,
    error,
  }
}
