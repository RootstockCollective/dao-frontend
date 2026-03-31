import type { StakingHistorySource } from '../types'
import { getStakingHistoryCountFromDB, getStakingHistoryFromDB } from './fetchFromDatabase'

export const stakingHistoryDatabaseSource: StakingHistorySource = {
  name: 'database',
  async fetchPageAndTotal(params) {
    const data = await getStakingHistoryFromDB({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
      sort_field: params.sort_field,
      sort_direction: params.sort_direction,
      type: params.type,
    })
    const total = await getStakingHistoryCountFromDB(params.address, params.type)
    return { data, total }
  },
}
