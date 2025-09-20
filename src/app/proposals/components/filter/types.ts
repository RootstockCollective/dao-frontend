import { Proposal } from '@/app/proposals/shared/types'

export enum FilterType {
  SEARCH = 'search',
  CATEGORY = 'category',
  STATUS = 'status',
  TIME = 'time',
}

export interface FilterItem {
  id: string
  type: FilterType
  label: string
  value: string
  isAll?: boolean // ex: All categories, All statuses, All proposals, etc.
  exclusive?: boolean // if true, it cannot be selected with other filters of the same type
  validate(proposal: Proposal): boolean
}

export interface FilterState {
  activeFilters: FilterItem[]
  searchValue: string
}

export interface FilterActions {
  addFilter: (f: FilterItem) => void
  removeFilter: (id: string) => void
  clearAllFilters: () => void
  updateSearchValue: (value: string) => void
}
