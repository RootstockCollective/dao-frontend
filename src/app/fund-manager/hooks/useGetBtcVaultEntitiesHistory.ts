import { useQuery } from '@tanstack/react-query'

import type { PaginationResponse } from '@/app/api/utils/types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { getBtcVaultHistoryEndpoint } from '@/lib/endpoints'

export interface BtcVaultEntityHistoryRow {
  id: string
  user: string
  action: string
  assets: string
  shares: string
  epochId: string
  timestamp: number
  blockNumber: string
  transactionHash: string
  displayStatus?: string
}

interface BtcVaultEntitiesHistoryResponse {
  data: BtcVaultEntityHistoryRow[]
  pagination: PaginationResponse & { totalPages: number }
}

interface UseGetBtcVaultEntitiesHistoryParams {
  page?: number
  pageSize?: number
  sortBy?: 'timestamp' | 'assets'
  sortDirection?: 'asc' | 'desc'
  type?: Array<
    | 'deposit_request'
    | 'deposit_claimed'
    | 'deposit_cancelled'
    | 'redeem_request'
    | 'redeem_claimed'
    | 'redeem_cancelled'
  >
}

async function fetchBtcVaultEntitiesHistory(
  params: UseGetBtcVaultEntitiesHistoryParams,
): Promise<BtcVaultEntitiesHistoryResponse> {
  const { page = 1, pageSize = 20, sortBy = 'timestamp', sortDirection = 'desc', type = [] } = params

  const searchParams = new URLSearchParams({
    sort_field: sortBy,
    sort_direction: sortDirection,
    limit: pageSize.toString(),
    page: page.toString(),
  })

  type.forEach(value => searchParams.append('type', value))

  const response = await fetch(`${getBtcVaultHistoryEndpoint}?${searchParams}`)
  if (!response.ok) throw new Error('Failed to fetch BTC vault history')

  const data = (await response.json()) as BtcVaultEntitiesHistoryResponse
  console.log('BTC vault history response', data)
  return data
}

export function useGetBtcVaultEntitiesHistory(params: UseGetBtcVaultEntitiesHistoryParams) {
  const { page = 1, pageSize = 20, sortBy = 'timestamp', sortDirection = 'desc', type = [] } = params

  const query = useQuery({
    queryKey: [
      'btc-vault',
      'entities-history',
      page,
      pageSize,
      sortBy,
      sortDirection,
      type.length > 0 ? [...type].sort().join(',') : '',
    ],
    queryFn: () => fetchBtcVaultEntitiesHistory({ page, pageSize, sortBy, sortDirection, type }),
    refetchInterval: AVERAGE_BLOCKTIME,
    retry: false, // Don't retry on 500 errors to prevent infinite loops
    refetchOnWindowFocus: false, // Don't refetch on focus to reduce API calls
  })

  return {
    data: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  }
}
