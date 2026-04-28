import { logger } from '@/lib/logger'

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

/**
 * Successful page from {@link fetchStakingHistoryFromSources}: one source supplied both the slice and total count.
 *
 * @example
 * ```json
 * {
 *   "data": [{ "period": "2025-01", "action": "STAKE", "amount": "1", "transactions": [] }],
 *   "total": 100,
 *   "sourceName": "database",
 *   "sourceIndex": 0
 * }
 * ```
 */
export interface StakingHistoryFetchSuccess {
  /** Period/action groups for the requested `limit` / `offset`. */
  data: StakingHistoryByPeriodAndAction[]
  /** Total groups across all pages for this source (not just `data.length`). */
  total: number
  /** Which backend answered (`database` or `blockscout`). */
  sourceName: StakingHistoryDataSourceName
  /** Index into {@link stakingHistorySources} (`0` = database, `1` = blockscout). */
  sourceIndex: number
}

/**
 * Tries each source in {@link stakingHistorySources} in order.
 * Empty history from a source that did not throw is a valid success (unlike proposals’ non-empty gate).
 *
 * @throws Error `name` `ALL_STAKING_HISTORY_SOURCES_FAILED` if every source throws.
 *
 * @returns {@link StakingHistoryFetchSuccess} — shape documented on that interface (`@example` there).
 */
export async function fetchStakingHistoryFromSources(
  params: StakingHistorySourceParams,
): Promise<StakingHistoryFetchSuccess> {
  for (const [i, source] of stakingHistorySources.entries()) {
    try {
      const { data, total } = await source.fetchPageAndTotal(params)
      return { data, total, sourceName: source.name, sourceIndex: i }
    } catch (error) {
      logger.error(
        { err: error, sourceName: source.name, sourceIndex: i },
        'Failed to fetch staking history from source',
      )
    }
  }

  const err = new Error('Can not fetch staking history from any source')
  err.name = 'ALL_STAKING_HISTORY_SOURCES_FAILED'
  throw err
}
