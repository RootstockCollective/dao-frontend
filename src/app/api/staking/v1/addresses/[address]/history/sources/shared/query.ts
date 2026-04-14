import type { StakingAction, StakingHistoryByPeriodAndAction } from '../../types'

export type StakingHistorySortField = 'period' | 'amount' | 'action'

/**
 * Sort and filter only (no pagination) — used for CSV export from Blockscout.
 *
 * @example
 * ```json
 * { "sort_field": "period", "sort_direction": "desc", "type": ["stake", "unstake"] }
 * ```
 */
export interface StakingHistorySortParams {
  sort_direction: 'asc' | 'desc'
  sort_field: StakingHistorySortField
  type?: ('stake' | 'unstake')[]
}

/**
 * Pagination + sort/filter params for staking history (DB or in-memory Blockscout path).
 *
 * @example
 * ```json
 * {
 *   "limit": 20,
 *   "offset": 0,
 *   "sort_field": "period",
 *   "sort_direction": "desc",
 *   "type": ["unstake"]
 * }
 * ```
 */
export interface StakingHistoryQueryParams extends StakingHistorySortParams {
  limit: number
  offset: number
}

/** Sorts `transactions` inside each group according to `sort_direction` (mutates `groups`). */
function sortTransactionsInPlace(
  groups: StakingHistoryByPeriodAndAction[],
  sort_direction: 'asc' | 'desc',
): void {
  const mul = sort_direction === 'asc' ? 1 : -1
  for (const g of groups) {
    g.transactions.sort((a, b) => (Number(a.timestamp) - Number(b.timestamp)) * mul)
  }
}

/** Comparator for two period+action groups using `sort_field` and `sort_direction`. */
function compareGroups(
  a: StakingHistoryByPeriodAndAction,
  b: StakingHistoryByPeriodAndAction,
  sort_field: StakingHistorySortField,
  sort_direction: 'asc' | 'desc',
): number {
  const dir = sort_direction === 'asc' ? 1 : -1
  if (sort_field === 'period') {
    return a.period.localeCompare(b.period) * dir
  }
  if (sort_field === 'amount') {
    const cmp = BigInt(a.amount) === BigInt(b.amount) ? 0 : BigInt(a.amount) < BigInt(b.amount) ? -1 : 1
    return cmp * dir
  }
  return a.action.localeCompare(b.action) * dir
}

/**
 * Filter by action type, sort transactions within groups, sort groups — full list (no slice).
 * Matches DB ordering semantics for export and Blockscout fallback.
 *
 * @example Input `groups` / `params` (abbreviated); output is the same shape, reordered/filtered.
 * ```json
 * {
 *   "groups": [
 *     { "period": "2025-02", "action": "STAKE", "amount": "2", "transactions": [] },
 *     { "period": "2025-01", "action": "UNSTAKE", "amount": "1", "transactions": [] }
 *   ],
 *   "params": { "sort_field": "period", "sort_direction": "desc", "type": ["stake"] }
 * }
 * ```
 */
export function filterSortStakingHistoryGroups(
  groups: StakingHistoryByPeriodAndAction[],
  params: StakingHistorySortParams,
): StakingHistoryByPeriodAndAction[] {
  let filtered = groups

  if (params.type && params.type.length > 0) {
    const allowed = new Set(params.type.map(t => t.toUpperCase() as StakingAction))
    filtered = groups.filter(g => allowed.has(g.action))
  }

  const working = filtered.map(g => ({
    ...g,
    transactions: [...g.transactions],
  }))

  sortTransactionsInPlace(working, params.sort_direction)
  working.sort((a, b) => compareGroups(a, b, params.sort_field, params.sort_direction))

  return working
}

/**
 * Applies the same filter, sort, and pagination semantics as the DB-backed staking history query,
 * on in-memory groups (e.g. from Blockscout).
 *
 * @example Return payload:
 * ```json
 * {
 *   "data": [{ "period": "2025-01", "action": "STAKE", "amount": "1", "transactions": [] }],
 *   "total": 25
 * }
 * ```
 */
export function filterSortPaginateStakingHistory(
  groups: StakingHistoryByPeriodAndAction[],
  params: StakingHistoryQueryParams,
): { data: StakingHistoryByPeriodAndAction[]; total: number } {
  const working = filterSortStakingHistoryGroups(groups, params)
  const total = working.length
  const data = working.slice(params.offset, params.offset + params.limit)
  return { data, total }
}
