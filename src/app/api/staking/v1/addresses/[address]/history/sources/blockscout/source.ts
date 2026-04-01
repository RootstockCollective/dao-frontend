import { filterSortPaginateStakingHistory } from '../shared/query'
import type { StakingHistorySource } from '../types'
import { fetchStakingHistoryFromBlockscout } from './fetchFromBlockscout'

/**
 * Staking history source backed by Blockscout `getLogs` for the stRIF contract (`STRIF_ADDRESS` in `@/lib/constants`).
 * Second in the ordered chain after the database (DAO-2058).
 */
export const stakingHistoryBlockscoutSource: StakingHistorySource = {
  name: 'blockscout',
  async fetchPageAndTotal(params) {
    const fromExplorer = await fetchStakingHistoryFromBlockscout(params.address)
    return filterSortPaginateStakingHistory(fromExplorer, {
      type: params.type,
      sort_field: params.sort_field,
      sort_direction: params.sort_direction,
      limit: params.limit,
      offset: params.offset,
    })
  },
}
