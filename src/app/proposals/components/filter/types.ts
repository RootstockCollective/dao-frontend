export interface FilterItem {
  id: string
  type: 'search' | 'category'
  label: string
  value: string
}

export interface FilterState {
  activeFilters: FilterItem[]
  searchValue: string
}

export interface FilterActions {
  addFilter: (filter: Omit<FilterItem, 'id'>) => void
  removeFilter: (id: string) => void
  removeFilterByValue: (value: string) => void
  clearAllFilters: () => void
  updateSearchValue: (value: string) => void
}
