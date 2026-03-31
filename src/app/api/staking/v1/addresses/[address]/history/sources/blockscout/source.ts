import { filterSortPaginateStakingHistory } from '../shared/query'
import type { StakingHistorySource } from '../types'
import { fetchStakingHistoryFromBlockscout } from './fetchFromBlockscout'

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
