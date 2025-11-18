export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  id: string
  title: string
  allLabel: string
  allTestId?: string
  options: FilterOption[]
  isMultiSelect?: boolean
}

export interface ActiveFilter {
  groupId: string
  option: FilterOption
}
