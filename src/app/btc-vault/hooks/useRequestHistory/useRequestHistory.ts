import { useQuery } from '@tanstack/react-query'

import type { PaginatedResult, PaginationParams, VaultRequest } from '../../services/types'
import { mapRequestDisplayStatus, toPaginatedHistoryDisplay } from '../../services/ui/mappers'
import type { HistoryFilterParams } from '../../services/ui/types'
import { MOCK_REQUESTS } from './mock-data'

const IS_MOCK_ENABLED =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_BTC_VAULT === 'true'

/** @internal Exported for testing. Will be removed when Feature 9 wires real backend. */
export function applyFilters(requests: VaultRequest[], filters?: HistoryFilterParams): VaultRequest[] {
  if (!filters) return requests

  let filtered = requests

  const { type, claimToken, status } = filters

  if (type?.length) {
    filtered = filtered.filter(r => type.includes(r.type))
  }

  if (claimToken?.length) {
    filtered = filtered.filter(r => {
      const tokenType = r.type === 'deposit' ? 'rbtc' : 'shares'
      return claimToken.includes(tokenType)
    })
  }

  if (status?.length) {
    filtered = filtered.filter(r => {
      const { displayStatus } = mapRequestDisplayStatus(r.status, r.type, r.failureReason)
      return status.includes(displayStatus)
    })
  }

  return filtered
}

/** @internal Exported for testing. Will be removed when Feature 9 wires real backend. */
export function paginate(requests: VaultRequest[], params: PaginationParams): PaginatedResult<VaultRequest> {
  const sorted = [...requests].sort((a, b) => {
    const dir = params.sortDirection === 'asc' ? 1 : -1
    return dir * (a.timestamps.created - b.timestamps.created)
  })
  const start = (params.page - 1) * params.limit
  return {
    data: sorted.slice(start, start + params.limit),
    total: requests.length,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(requests.length / params.limit),
  }
}

/**
 * Fetches paginated, filtered, and sorted request history for the BTC vault.
 * Uses mock data when NEXT_PUBLIC_MOCK_BTC_VAULT=true in development;
 * otherwise returns empty results until the real data layer is wired (Feature 9).
 * @param address - Connected wallet address; query is disabled when undefined
 * @param params - Pagination and sort parameters
 * @param filters - Optional filter criteria (type, claim token, display status)
 */
export function useRequestHistory(
  address: string | undefined,
  params: PaginationParams,
  filters?: HistoryFilterParams,
) {
  const source = IS_MOCK_ENABLED ? MOCK_REQUESTS : []

  return useQuery({
    queryKey: ['btc-vault', 'history', address, params, filters],
    queryFn: () => toPaginatedHistoryDisplay(paginate(applyFilters(source, filters), params)),
    enabled: !!address,
    staleTime: Infinity,
  })
}
