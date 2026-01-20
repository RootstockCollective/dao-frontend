import { useQuery } from '@tanstack/react-query'
import { TransactionHistoryItem } from '@/app/my-rewards/tx-history/utils/types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useAccount } from 'wagmi'

type TransactionHistoryResponse = {
  data: TransactionHistoryItem[]
  count: number
  page: number
  pageSize: number
}

type UseGetBuilderTransactionHistoryParams = {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  rewardToken?: string[]
}

const EMPTY_DATA = [] as TransactionHistoryItem[]

/**
 * Hook to fetch transaction history for builders.
 * Uses the role=builder parameter to get claims where backer IS NULL.
 */
export const useGetBuilderTransactionHistory = (params?: UseGetBuilderTransactionHistoryParams) => {
  const { address } = useAccount()
  const {
    page = 1,
    pageSize = 20,
    sortBy = 'blockTimestamp',
    sortDirection = 'desc',
    rewardToken = [],
  } = params || {}

  const { data, isLoading, error } = useQuery<TransactionHistoryResponse, Error>({
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      if (!address) {
        return { data: EMPTY_DATA, count: 0, page: 1, pageSize: 20 }
      }

      const searchParams = new URLSearchParams({
        role: 'builder',
        sortBy,
        sortDirection,
        pageSize: pageSize.toString(),
        page: page.toString(),
      })

      // Add filter parameters
      rewardToken.forEach(rt => searchParams.append('rewardToken', rt))

      const response = await fetch(`/api/backers/${address}/tx-history/context?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch builder transaction history')
      }

      const result = await response.json()

      return result as TransactionHistoryResponse
    },
    queryKey: ['builderTransactionHistory', address, page, pageSize, sortBy, sortDirection, rewardToken],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !!address,
  })

  return {
    data: data?.data || EMPTY_DATA,
    count: data?.count || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 20,
    isLoading,
    error,
  }
}
