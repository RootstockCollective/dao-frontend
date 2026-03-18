import { useQuery } from '@tanstack/react-query'

import type { PaginationResponse } from '@/app/api/utils/types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { getBtcVaultHistoryEndpoint } from '@/lib/endpoints'

export interface BtcVaultEntityHistoryRow {
  id: string
  investor: string
  entity: string
  type: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  shares: string
  status: string
  requestTimestamp: number
  requestBlockNumber: string
  requestTransactionHash: string
  claimTimestamp: number | null
  claimTransactionHash: string | null
}

interface BtcVaultEntitiesHistoryResponse {
  data: BtcVaultEntityHistoryRow[]
  pagination: PaginationResponse & { totalPages: number }
}

interface UseGetBtcVaultEntitiesHistoryParams {
  page?: number
  pageSize?: number
  sortBy?: 'requestTimestamp' | 'assets' | 'status' | 'type' | 'investor' | 'entity'
  sortDirection?: 'asc' | 'desc'
  type?: Array<'deposit' | 'withdraw'>
}

async function fetchBtcVaultEntitiesHistory(
  params: UseGetBtcVaultEntitiesHistoryParams,
): Promise<BtcVaultEntitiesHistoryResponse> {
  const { page = 1, pageSize = 20, sortBy = 'requestTimestamp', sortDirection = 'desc', type = [] } = params

  const searchParams = new URLSearchParams({
    sort_field: sortBy,
    sort_direction: sortDirection,
    limit: pageSize.toString(),
    page: page.toString(),
  })

  type.forEach(value => searchParams.append('type', value))

  const response = await fetch(`${getBtcVaultHistoryEndpoint}?${searchParams}`)
  if (!response.ok) throw new Error('Failed to fetch BTC vault entities history')

  const data = (await response.json()) as BtcVaultEntitiesHistoryResponse
  console.log('BTC vault entities history response', data)
  return data
}

export function useGetBtcVaultEntitiesHistory(params: UseGetBtcVaultEntitiesHistoryParams) {
  const { page = 1, pageSize = 20, sortBy = 'requestTimestamp', sortDirection = 'desc', type = [] } = params

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
  })

  return {
    data: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  }
}
