import { useQuery } from '@tanstack/react-query'
import { TransactionHistoryItem } from '../utils/types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useAccount } from 'wagmi'

type TransactionHistoryResponse = {
  data: TransactionHistoryItem[]
  count: number
  page: number
  pageSize: number
}

type UseGetTransactionHistoryParams = {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export const useGetTransactionHistory = (params?: UseGetTransactionHistoryParams) => {
  const { address } = useAccount()
  const { page = 1, pageSize = 20, sortBy = 'blockTimestamp', sortDirection = 'desc' } = params || {}

  const { data, isLoading, error } = useQuery<TransactionHistoryResponse, Error>({
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      if (!address) {
        return { data: [], count: 0, page: 1, pageSize: 20 }
      }

      const searchParams = new URLSearchParams({
        sortBy,
        sortDirection,
        pageSize: pageSize.toString(),
        page: page.toString(),
      })

      const response = await fetch(`/api/backers/${address}/tx-history/context?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history')
      }

      const result = await response.json()
      console.log('Transaction history response:', result)

      return result as TransactionHistoryResponse
    },
    queryKey: ['transactionHistory', address, page, pageSize, sortBy, sortDirection],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !!address,
  })

  return {
    data: data?.data || [],
    count: data?.count || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 20,
    isLoading,
    error,
  }
}

// Legacy export for backward compatibility
export const useGetAllocationHistory = useGetTransactionHistory
