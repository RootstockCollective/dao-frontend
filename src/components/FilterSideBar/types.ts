import { ReactNode } from 'react'

export interface FilterOption {
  label: string
  value: string
  icon?: ReactNode
}

export interface FilterGroup {
  id: string
  title: string
  allLabel: string
  options: FilterOption[]
  allTestId?: string
  isMultiSelect?: boolean
}

export interface ActiveFilter {
  groupId: string
  option: FilterOption
}
