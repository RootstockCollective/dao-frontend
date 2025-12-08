import { getStakingHistoryEndpoint } from '@/lib/endpoints'
import { StakingHistoryItem } from './types'

export interface StakingHistoryResponse {
  data: StakingHistoryItem[]
  pagination: {
    total: number
    limit: number
    page: number
  }
}

export interface FetchStakingHistoryParams {
  address: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  type?: string[]
}

export async function fetchStakingHistory(
  params: FetchStakingHistoryParams,
): Promise<StakingHistoryResponse> {
  const { address, page = 1, pageSize = 20, sortBy = 'period', sortDirection = 'desc', type = [] } = params

  const searchParams = new URLSearchParams({
    sort_field: sortBy,
    sort_direction: sortDirection,
    limit: pageSize.toString(),
    page: page.toString(),
  })

  // Add filter parameters
  type.forEach(t => searchParams.append('type', t))

  const endpoint = getStakingHistoryEndpoint.replace('{{address}}', address.toLowerCase())
  const response = await fetch(`${endpoint}?${searchParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch transaction history')
  }

  return response.json() as Promise<StakingHistoryResponse>
}
