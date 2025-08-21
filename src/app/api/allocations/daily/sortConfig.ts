import { SortConfig } from '../../types'

export const sortConfig: SortConfig = {
  allowedColumns: ['id', 'day', 'totalAllocation'],
  castedSortFieldsMap: {
    totalAllocation: 'NUMERIC',
  },
}
