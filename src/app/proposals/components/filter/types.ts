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
}

export interface FilterState {
  activeFilters: FilterItem[]
  searchValue: string
}

export interface FilterActions {
  removeFilter: (id: string) => void
  setFilters: (filters: FilterItem[]) => void
  clearAllFilters: () => void
  updateSearchValue: (value: string) => void
}
