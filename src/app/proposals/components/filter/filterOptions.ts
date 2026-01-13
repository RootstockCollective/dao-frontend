import { MILESTONE_SEPARATOR } from '@/app/proposals/shared/utils'
import { Milestones } from '@/app/proposals/shared/types'
import { FilterItem, FilterType } from './types'

export interface FilterOption {
  label: string
  value: string
}

// Simple filter options for UI
export const categoryFilterOptions: FilterOption[] = [
  { label: 'Grants', value: 'Grants' },
  { label: 'Builder', value: 'Builder' },
  { label: 'Grant - all milestones', value: MILESTONE_SEPARATOR },
  { label: 'Grants - milestone 1', value: `${MILESTONE_SEPARATOR}${Milestones.MILESTONE_1}` },
  { label: 'Grants - milestone 2', value: `${MILESTONE_SEPARATOR}${Milestones.MILESTONE_2}` },
  { label: 'Grants - milestone 3', value: `${MILESTONE_SEPARATOR}${Milestones.MILESTONE_3}` },
]

export const statusFilterOptions: FilterOption[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Active', value: 'Active' },
  { label: 'Executed', value: 'Executed' },
  { label: 'Defeated', value: 'Defeated' },
]

export const timeFilterOptions: FilterOption[] = [
  { label: 'Last week', value: 'last-week' },
  { label: 'Last month', value: 'last-month' },
  { label: 'Last 90 days', value: 'last-90-days' },
  { label: 'Wave 4', value: 'Wave 4' },
  { label: 'Wave 5', value: 'Wave 5' },
  { label: 'March-25', value: 'March-25' },
]

// Unified function to create FilterItem objects based on type
export const createFilter = (
  type: FilterType,
  option: FilterOption,
  isAll = false,
  exclusive = false,
): FilterItem => ({
  id: `${type}-${option.value}-${Date.now()}`,
  type,
  label: option.label,
  value: option.value,
  isAll,
  exclusive,
})

// Utility function for search filters (they don't use FilterOption)
export const createSearchFilter = (value: string): FilterItem =>
  createFilter(FilterType.SEARCH, { label: value, value }, false)

// Create "All" filters for each type using unified function
export const createAllFilters = (): FilterItem[] => [
  createFilter(FilterType.CATEGORY, { label: 'All categories', value: '' }, true, false),
  createFilter(FilterType.STATUS, { label: 'All statuses', value: '' }, true, false),
  createFilter(FilterType.TIME, { label: 'All proposals', value: '' }, true, true), // Time filters are exclusive
]
