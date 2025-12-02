import { useQuery } from '@tanstack/react-query'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useAccount } from 'wagmi'
import { StakingHistoryItem } from '../utils/types'

interface StakingHistoryResponse {
  data: StakingHistoryItem[]
  pagination: {
    total: number
    limit: number
    page: number
  }
}

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

      const searchParams = new URLSearchParams({
        sort_field: sortBy,
        sort_direction: sortDirection,
        limit: pageSize.toString(),
        page: page.toString(),
      })

      // Add filter parameters
      type.forEach(t => searchParams.append('type', t))

      const response = await fetch(
        `/api/staking/v1/addresses/${address.toLowerCase()}/history?${searchParams}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history')
      }

      const result = await response.json()

      return result as StakingHistoryResponse
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

  return {
    data: data?.data || [],
    count: data?.pagination?.total || 0,
    page: data?.pagination?.page || 1,
    pageSize: data?.pagination?.limit || 20,
    isLoading,
    error,
  }
}
