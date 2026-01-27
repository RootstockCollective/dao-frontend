import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { TransactionHistoryItem } from '../utils/types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useAccount } from 'wagmi'
import { usePricesContext } from '@/shared/context/PricesContext'
import { TOKENS } from '@/lib/tokens'

type TransactionHistoryResponse = {
  data: TransactionHistoryItem[]
  count: number
  page: number
  pageSize: number
}

type UseGetTransactionHistoryParams = {
  role?: 'backer' | 'builder'
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  rewardToken?: string[]
  type?: string[] // used for backer role
  builder?: string[] // used for backer role
}

const EMPTY_DATA = [] as TransactionHistoryItem[]

/**
 * Hook to fetch transaction history for backers.
 * Uses the role=backer parameter to get claims where backer IS NOT NULL.
 */
export const useGetBackerTransactionHistory = (params?: Omit<UseGetTransactionHistoryParams, 'role'>) => {
  return useGetTransactionHistory({ ...params, role: 'backer' })
}

/**
 * Hook to fetch transaction history for builders.
 * Uses the role=builder parameter to get claims where backer IS NULL.
 */
export const useGetBuilderTransactionHistory = (
  params?: Omit<UseGetTransactionHistoryParams, 'role' | 'type' | 'builder'>,
) => {
  return useGetTransactionHistory({ ...params, role: 'builder' })
}

/**
 * Hook to fetch transaction history for both backers and builders.
 * Uses the role parameter to determine the query type.
 */
export const useGetTransactionHistory = (params?: UseGetTransactionHistoryParams) => {
  const { address } = useAccount()
  const { prices } = usePricesContext()
  const {
    role = 'backer',
    page = 1,
    pageSize = 20,
    sortBy = 'blockTimestamp',
    sortDirection = 'desc',
    type = [],
    builder = [],
    rewardToken = [],
  } = params || {}

  const { data, isLoading, error } = useQuery<TransactionHistoryResponse, Error>({
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      if (!address) {
        return { data: EMPTY_DATA, count: 0, page: 1, pageSize: 20 }
      }

      const searchParams = new URLSearchParams({
        role,
        sortBy,
        sortDirection,
        pageSize: pageSize.toString(),
        page: page.toString(),
      })

      // Add filter parameters (only relevant for backer role)
      if (role === 'backer') {
        type.forEach(t => searchParams.append('type', t))
        builder.forEach(b => searchParams.append('builder', b))

        // Add price parameters so the API can compute USD totals for sorting
        Object.values(TOKENS).forEach(token => {
          const priceInfo = prices[token.symbol]
          if (!priceInfo) return

          const decimals = 18
          searchParams.append('price', `${token.address.toLowerCase()}:${priceInfo.price}:${decimals}`)
        })
      }

      rewardToken.forEach(rt => searchParams.append('rewardToken', rt))

      const response = await fetch(`/api/backers/${address}/tx-history/context?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history')
      }

      const result = await response.json()

      return result as TransactionHistoryResponse
    },
    queryKey: [
      role === 'backer' ? 'backerTransactionHistory' : 'builderTransactionHistory',
      address,
      page,
      pageSize,
      sortBy,
      sortDirection,
      type,
      builder,
      rewardToken,
    ],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !!address,
    placeholderData: keepPreviousData,
  })

  return {
    data: data?.data || EMPTY_DATA, // use stable reference to avoid re-rendering the table on every render
    count: data?.count || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 20,
    isLoading,
    error,
  }
}
