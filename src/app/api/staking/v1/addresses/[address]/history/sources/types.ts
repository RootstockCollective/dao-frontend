import type { StakingHistoryByPeriodAndAction } from '../types'

/** Identifies which backend served the history response (observability). */
export type StakingHistoryDataSourceName = 'database' | 'blockscout'

/**
 * Request context shared by every staking history source (DB, Blockscout, …).
 *
 * @example
 * ```json
 * {
 *   "address": "0xabc…",
 *   "limit": 20,
 *   "offset": 0,
 *   "sort_field": "period",
 *   "sort_direction": "desc",
 *   "type": ["stake"]
 * }
 * ```
 */
export interface StakingHistorySourceParams {
  address: string
  limit: number
  offset: number
  sort_field: 'period' | 'amount' | 'action'
  sort_direction: 'asc' | 'desc'
  type?: ('stake' | 'unstake')[]
}

/**
 * One page from a single staking history source.
 *
 * @example
 * ```json
 * {
 *   "data": [{ "period": "2025-01", "action": "STAKE", "amount": "1", "transactions": [] }],
 *   "total": 100
 * }
 * ```
 */
export interface StakingHistoryPageResult {
  data: StakingHistoryByPeriodAndAction[]
  total: number
}

/**
 * One staking history data source: returns a paginated page and total count from that backend only.
 * Same structural idea as the proposals source chain and BTC vault `BtcVaultHistorySource`.
 */
export interface StakingHistorySource {
  name: StakingHistoryDataSourceName
  fetchPageAndTotal: (params: StakingHistorySourceParams) => Promise<StakingHistoryPageResult>
}
