import { useQuery } from '@tanstack/react-query'

import type { PaginationParams } from '../../services/types'
import type { BtcVaultHistoryApiResponse } from '../../services/ui/api-types'
import { historyFiltersToApiTypes } from '../../services/ui/history-filter-mapping'
import { apiHistoryToPaginatedDisplay } from '../../services/ui/mappers'
import type { HistoryFilterParams } from '../../services/ui/types'

const HISTORY_API_PATH = '/api/btc-vault/v1/history'

/**
 * Maps UI PaginationParams.sortField to API sort_field (timestamp | assets).
 * Defaults to 'timestamp' when sortField is undefined or 'date'.
 */
function toApiSortField(sortField: string | undefined): 'timestamp' | 'assets' {
  if (sortField === 'amount') return 'assets'
  return 'timestamp'
}

/**
 * Builds query string for GET /api/btc-vault/v1/history.
 * Params: address (required), page, limit, sort_field, sort_direction, type[] (when filters yield types).
 */
function buildHistoryUrl(
  address: string,
  params: PaginationParams,
  filters: HistoryFilterParams | undefined,
): string {
  const sort_field = toApiSortField(params.sortField)
  const sort_direction = params.sortDirection ?? 'desc'
  const apiTypes = historyFiltersToApiTypes(filters)

  const searchParams = new URLSearchParams()
  searchParams.set('address', address)
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  searchParams.set('sort_field', sort_field)
  searchParams.set('sort_direction', sort_direction)
  apiTypes.forEach(t => searchParams.append('type', t))

  return `${HISTORY_API_PATH}?${searchParams.toString()}`
}

/**
 * Fetches paginated, filtered, and sorted request history from GET /api/btc-vault/v1/history.
 * Response is adapted with `apiHistoryToPaginatedDisplay` (DTO → view model: `displayStatus`,
 * type-aware `displayStatusLabel`); table/cards must consume this output, not raw JSON.
 * Applies client-side status filter when `filters.status` is set. Pagination `total` / `totalPages`
 * stay API values (unfiltered history); the table pager shows matching counts when status is filtered.
 *
 * @param address - Connected wallet address; query is disabled when undefined
 * @param params - Pagination and sort parameters (page, limit, sortField, sortDirection)
 * @param filters - Optional filter criteria (type, claim token, display status); status is filtered client-side
 * @param rbtcPrice
 */
export function useRequestHistory(
  address: string | undefined,
  params: PaginationParams,
  filters?: HistoryFilterParams,
  rbtcPrice = 0,
) {
  return useQuery({
    queryKey: ['btc-vault', 'history', address, params, filters, rbtcPrice],
    queryFn: async () => {
      if (!address) throw new Error('address is required')
      const url = buildHistoryUrl(address, params, filters)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`History API error: ${res.status}`)
      const response = (await res.json()) as BtcVaultHistoryApiResponse
      const result = apiHistoryToPaginatedDisplay(response, rbtcPrice)

      if (filters?.status?.length) {
        const statusSet = new Set(filters.status)
        const rawRowCountBeforeStatusFilter = result.rows.length
        const filteredRows = result.rows.filter(row => statusSet.has(row.displayStatusLabel))
        return { ...result, rows: filteredRows, rawRowCountBeforeStatusFilter }
      }

      return result
    },
    enabled: !!address,
    staleTime: Infinity,
  })
}
