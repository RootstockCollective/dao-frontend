import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useAccount } from 'wagmi'
import { fetchStakingHistory, StakingHistoryResponse } from '../utils/api'
import { StakingHistoryItem } from '../utils/types'

// Stable empty array to prevent infinite re-renders when no data
const EMPTY_DATA: StakingHistoryItem[] = []

interface UseGetStakingHistoryParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  type?: string[]
}

export const useGetStakingHistory = (params?: UseGetStakingHistoryParams) => {
  const { address } = useAccount()
  const { page = 1, pageSize = 20, sortBy = 'period', sortDirection = 'desc', type = [] } = params || {}

  const { data, isLoading, error } = useQuery<StakingHistoryResponse, Error>({
    queryFn: async (): Promise<StakingHistoryResponse> => {
      if (!address) {
        return { data: [], pagination: { total: 0, page: 1, limit: 20 } }
      }

      return fetchStakingHistory({
        address,
        page,
        pageSize,
        sortBy,
        sortDirection,
        type,
      })
    },
    // Serialize type array to ensure stable query key (sort copy to avoid mutation)
    queryKey: [
      'stakingHistory',
      address,
      page,
      pageSize,
      sortBy,
      sortDirection,
      type.length > 0 ? [...type].sort().join(',') : '',
    ],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !!address,
  })

  // Memoize data to prevent infinite re-renders
  const stableData = useMemo(() => data?.data ?? EMPTY_DATA, [data?.data])

  return {
    data: stableData,
    count: data?.pagination?.total ?? 0,
    page: data?.pagination?.page ?? 1,
    pageSize: data?.pagination?.limit ?? 20,
    isLoading,
    error,
  }
}
