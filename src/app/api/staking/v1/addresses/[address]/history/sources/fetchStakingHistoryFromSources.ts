import type { StakingHistoryByPeriodAndAction } from '../types'
import { stakingHistoryBlockscoutSource } from './blockscout/source'
import { stakingHistoryDatabaseSource } from './database/source'
import type { StakingHistoryDataSourceName, StakingHistorySource, StakingHistorySourceParams } from './types'

/**
 * Ordered staking history sources: database first, then Blockscout (DAO-2058).
 * Same pattern as `fetchAllProposals`: ordered sources, try each until one succeeds without throwing.
 */
export const stakingHistorySources: readonly StakingHistorySource[] = [
  stakingHistoryDatabaseSource,
  stakingHistoryBlockscoutSource,
]

export interface StakingHistoryFetchSuccess {
  data: StakingHistoryByPeriodAndAction[]
  total: number
  sourceName: StakingHistoryDataSourceName
  sourceIndex: number
}

/**
 * Tries each source in {@link stakingHistorySources} in order.
 * Empty history from a source that did not throw is a valid success (unlike proposals’ non-empty gate).
 *
 * @throws Error `name` `ALL_STAKING_HISTORY_SOURCES_FAILED` if every source throws.
 */
export async function fetchStakingHistoryFromSources(
  params: StakingHistorySourceParams,
): Promise<StakingHistoryFetchSuccess> {
  for (const [i, source] of stakingHistorySources.entries()) {
    try {
      const { data, total } = await source.fetchPageAndTotal(params)
      return { data, total, sourceName: source.name, sourceIndex: i }
    } catch (error) {
      console.error(`Failed to fetch staking history from source "${source.name}":`, error)
    }
  }

  const err = new Error('Can not fetch staking history from any source')
  err.name = 'ALL_STAKING_HISTORY_SOURCES_FAILED'
  throw err
}
