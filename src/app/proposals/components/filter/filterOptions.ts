import { MILESTONE_SEPARATOR } from '../../shared/utils'

export const filterOptions = [
  { label: 'Grants', value: 'Grants' },
  { label: 'Builder', value: 'Builder' },
  { label: 'Wave 4', value: 'Wave 4' },
  { label: 'Wave 5', value: 'Wave 5' },
  { label: 'March-25', value: 'March-25' },
  { label: 'Grant - all milestones', value: MILESTONE_SEPARATOR },
  { label: 'Grants - milestone 1', value: `${MILESTONE_SEPARATOR}1` },
  { label: 'Grants - milestone 2', value: `${MILESTONE_SEPARATOR}2` },
  { label: 'Grants - milestone 3', value: `${MILESTONE_SEPARATOR}3` },
]

export type FilterOption = (typeof filterOptions)[number]
