import type { HistoryFilterParams } from './types'

const DEPOSIT_API_TYPES: readonly string[] = ['deposit_request', 'deposit_claimed', 'deposit_cancelled']
const REDEEM_API_TYPES: readonly string[] = ['redeem_request', 'redeem_claimed', 'redeem_cancelled']

/**
 * Maps UI history filters (type, claimToken) to API type[] for GET /api/btc-vault/v1/history.
 * Combines type (deposit/withdrawal) and claimToken (rbtc/shares) and deduplicates.
 *
 * Note: Status filter is not sent to the API; it is applied client-side by the hook
 * to the returned page rows (filter by displayStatus).
 *
 * @param filters - Current UI filter params (type, claimToken, status)
 * @returns API type[] (e.g. ['deposit_request', 'deposit_claimed', 'deposit_cancelled']). Empty array when no filters so caller omits type[] and API returns all.
 */
export function historyFiltersToApiTypes(filters: HistoryFilterParams | undefined): string[] {
  if (!filters || (!filters.type?.length && !filters.claimToken?.length)) {
    return []
  }

  const types = new Set<string>()

  if (filters.type?.includes('deposit')) {
    DEPOSIT_API_TYPES.forEach(t => types.add(t))
  }
  if (filters.type?.includes('withdrawal')) {
    REDEEM_API_TYPES.forEach(t => types.add(t))
  }
  if (filters.claimToken?.includes('rbtc')) {
    DEPOSIT_API_TYPES.forEach(t => types.add(t))
  }
  if (filters.claimToken?.includes('shares')) {
    REDEEM_API_TYPES.forEach(t => types.add(t))
  }

  return types.size > 0 ? [...types] : []
}
