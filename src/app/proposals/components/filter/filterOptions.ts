import { MILESTONE_SEPARATOR } from '@/app/proposals/shared/utils'
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
  { label: 'Grants - milestone 1', value: `${MILESTONE_SEPARATOR}1` },
  { label: 'Grants - milestone 2', value: `${MILESTONE_SEPARATOR}2` },
  { label: 'Grants - milestone 3', value: `${MILESTONE_SEPARATOR}3` },
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

// Helper functions to create FilterItem objects
export const createSearchFilter = (value: string): FilterItem => ({
  id: `search-${value}-${Date.now()}`,
  type: FilterType.SEARCH,
  label: value,
  value,
})

export const createCategoryFilter = (option: FilterOption, isAll = false): FilterItem => ({
  id: `category-${option.value}-${Date.now()}`,
  type: FilterType.CATEGORY,
  label: option.label,
  value: option.value,
  isAll,
})

export const createStatusFilter = (option: FilterOption, isAll = false): FilterItem => ({
  id: `status-${option.value}-${Date.now()}`,
  type: FilterType.STATUS,
  label: option.label,
  value: option.value,
  isAll,
})

export const createTimeFilter = (option: FilterOption, isAll = false): FilterItem => ({
  id: `time-${option.value}-${Date.now()}`,
  type: FilterType.TIME,
  label: option.label,
  value: option.value,
  isAll,
  exclusive: true, // Time filters are exclusive
})

// Create "All" filters for each type
export const createAllFilters = (): FilterItem[] => [
  {
    id: 'category-all',
    type: FilterType.CATEGORY,
    label: 'All categories',
    value: '',
    isAll: true,
  },
  {
    id: 'status-all',
    type: FilterType.STATUS,
    label: 'All statuses',
    value: '',
    isAll: true,
  },
  {
    id: 'time-all',
    type: FilterType.TIME,
    label: 'All proposals',
    value: '',
    isAll: true,
    exclusive: true,
  },
]
