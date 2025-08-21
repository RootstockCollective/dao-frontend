import { SortConfig } from '../types'

export const sortConfig: SortConfig = {
  allowedColumns: [
    'id',
    'rewardsERC20',
    'rewardsRBTC',
    'cycleStart',
    'cycleDuration',
    'distributionDuration',
    'onDistributionPeriod',
  ],
  castedSortFieldsMap: {
    rewardsERC20: 'NUMERIC',
    rewardsRBTC: 'NUMERIC',
    cycleDuration: 'NUMERIC',
    distributionDuration: 'NUMERIC',
    onDistributionPeriod: 'NUMERIC',
  },
}
