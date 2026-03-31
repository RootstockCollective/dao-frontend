import type { StakingHistoryByPeriodAndAction } from '../types'
import { fetchStakingHistoryFromBlockscout } from './blockscout/fetchFromBlockscout'
import { getStakingHistoryCountFromDB, getStakingHistoryFromDB } from './database/fetchFromDatabase'
import type { StakingHistorySortParams } from './shared/query'
import { filterSortStakingHistoryGroups } from './shared/query'

/**
 * Result of choosing how to build the staking history CSV: batched DB reads or a full in-memory Blockscout list.
 */
export type StakingHistoryCsvPlan =
  | {
      kind: 'database'
      firstBatch: StakingHistoryByPeriodAndAction[]
      totalCount: number
      pageSize: number
      address: string
      sortParams: StakingHistorySortParams
    }
  | {
      kind: 'blockscout'
      groups: StakingHistoryByPeriodAndAction[]
    }

/**
 * Tries the database first (first page + count). On any failure, loads and sorts all groups from Blockscout.
 * Same source order as {@link fetchStakingHistoryFromSources}.
 *
 * @throws Error with `name` `ALL_STAKING_HISTORY_SOURCES_FAILED` if both paths fail.
 */
export async function resolveStakingHistoryCsvPlan(
  address: string,
  sortParams: StakingHistorySortParams,
  pageSize: number,
): Promise<StakingHistoryCsvPlan> {
  try {
    const firstBatch = await getStakingHistoryFromDB({
      address,
      limit: pageSize,
      offset: 0,
      sort_field: sortParams.sort_field,
      sort_direction: sortParams.sort_direction,
      type: sortParams.type,
    })
    const totalCount = await getStakingHistoryCountFromDB(address, sortParams.type)
    return {
      kind: 'database',
      firstBatch,
      totalCount,
      pageSize,
      address,
      sortParams,
    }
  } catch {
    try {
      const raw = await fetchStakingHistoryFromBlockscout(address)
      const groups = filterSortStakingHistoryGroups(raw, sortParams)
      return { kind: 'blockscout', groups }
    } catch {
      const err = new Error('Can not fetch staking history from any source')
      err.name = 'ALL_STAKING_HISTORY_SOURCES_FAILED'
      throw err
    }
  }
}

export function stakingHistoryCsvSourceHeaders(plan: StakingHistoryCsvPlan): {
  'X-Source': string
  'x-source-name': string
} {
  if (plan.kind === 'database') {
    return { 'X-Source': 'source-0', 'x-source-name': 'database' }
  }
  return { 'X-Source': 'source-1', 'x-source-name': 'blockscout' }
}
