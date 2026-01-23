import { getVaultHistoryEndpoint } from '@/lib/endpoints'
import { VaultHistoryItem } from './types'

export interface VaultHistoryResponse {
  data: VaultHistoryItem[]
  pagination: {
    total: number
    limit: number
    page: number
    totalPages: number
  }
}

export interface FetchVaultHistoryParams {
  address: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  type?: string[]
}

export async function fetchVaultHistory(params: FetchVaultHistoryParams): Promise<VaultHistoryResponse> {
  const { address, page = 1, pageSize = 20, sortBy = 'period', sortDirection = 'desc', type = [] } = params

  const searchParams = new URLSearchParams({
    sort_field: sortBy,
    sort_direction: sortDirection,
    limit: pageSize.toString(),
    page: page.toString(),
  })

  // Add filter parameters
  type.forEach(t => searchParams.append('type', t))

  const endpoint = getVaultHistoryEndpoint.replace('{{address}}', address.toLowerCase())
  const response = await fetch(`${endpoint}?${searchParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch vault history')
  }

  return response.json() as Promise<VaultHistoryResponse>
}
