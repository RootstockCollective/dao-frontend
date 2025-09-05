import { MILESTONE_SEPARATOR } from '../../shared/utils'

// Category filters
export const categoryFilterOptions = [
  { label: 'Grants', value: 'Grants' },
  { label: 'Builder', value: 'Builder' },
  { label: 'Grant - all milestones', value: MILESTONE_SEPARATOR },
  { label: 'Grants - milestone 1', value: `${MILESTONE_SEPARATOR}1` },
  { label: 'Grants - milestone 2', value: `${MILESTONE_SEPARATOR}2` },
  { label: 'Grants - milestone 3', value: `${MILESTONE_SEPARATOR}3` },
]

// Status filters
export const statusFilterOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Active', value: 'Active' },
  { label: 'Executed', value: 'Executed' },
  { label: 'Defeated', value: 'Defeated' },
]

// Time filters
export const timeFilterOptions = [
  { label: 'Last week', value: 'last-week' },
  { label: 'Last month', value: 'last-month' },
  { label: 'Last 90 days', value: 'last-90-days' },
  { label: 'Wave 4', value: 'Wave 4' },
  { label: 'Wave 5', value: 'Wave 5' },
  { label: 'March-25', value: 'March-25' },
]

export interface FilterOption {
  label: string
  value: string
}
