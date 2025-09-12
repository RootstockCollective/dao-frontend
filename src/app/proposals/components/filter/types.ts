import { Proposal } from '@/app/proposals/shared/types'

export enum FilterType {
  SEARCH = 'search',
  CATEGORY = 'category',
  STATUS = 'status',
  TIME = 'time',
}

export interface CategoryFilterItem {
  label: string
  value?: string
  exclusive?: boolean
}

export interface FilterItem {
  id: string
  type: FilterType
  label: string
  value?: string
  isAll?: boolean
  exclusive?: boolean
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
