import { DEPOSIT_ACTION_TYPES, REDEEM_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'

import type { HistoryFilterParams } from './types'

/**
 * Maps UI history filters (type, claimToken) to API type[] for GET /api/btc-vault/v1/history.
 * Uses action types from API schemas (single source of truth). Combines type (deposit/withdrawal)
 * and claimToken (rbtc/shares) and deduplicates.
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
    DEPOSIT_ACTION_TYPES.forEach(t => types.add(t))
  }
  if (filters.type?.includes('withdrawal')) {
    REDEEM_ACTION_TYPES.forEach(t => types.add(t))
  }
  if (filters.claimToken?.includes('rbtc')) {
    DEPOSIT_ACTION_TYPES.forEach(t => types.add(t))
  }
  if (filters.claimToken?.includes('shares')) {
    REDEEM_ACTION_TYPES.forEach(t => types.add(t))
  }

  return types.size > 0 ? [...types] : []
}
