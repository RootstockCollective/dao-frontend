import { MILESTONE_SEPARATOR } from '@/app/proposals/shared/utils'
import { FilterItem, FilterType } from './types'
import { Proposal } from '../../shared/types'

export const createSearchFilter = (value: string): FilterItem => ({
  id: `search-${value}-${Date.now()}`,
  type: FilterType.SEARCH,
  label: value,
  value,
  validate: (proposal: Proposal) => {
    return [
      proposal.name,
      proposal.description,
      proposal.category,
      proposal.proposer,
      proposal.proposalId,
    ].some(param => param.toLowerCase()?.includes(value.toLowerCase()))
  },
})

interface CategoryFilterItem {
  value: string
  label: string
  exclusive?: boolean
}

export const createCategoryFilter = ({ value, label, exclusive }: CategoryFilterItem): FilterItem => ({
  id: `category-${value}-${Date.now()}`,
  type: FilterType.CATEGORY,
  label,
  value,
  exclusive,
  validate: (proposal: Proposal) => {
    return proposal.category?.toLowerCase().includes(value.toLowerCase())
  },
})

export const createMilestoneFilter = ({ value, label }: CategoryFilterItem): FilterItem => ({
  id: `milestone-${value}-${Date.now()}`,
  type: FilterType.CATEGORY,
  label,
  value,
  validate: (proposal: Proposal) => {
    return proposal.description?.toLowerCase().includes(value.toLowerCase())
  },
})

export const filterCategoryOptions: FilterItem[] = [
  createCategoryFilter({ label: 'All categories', value: '', exclusive: true }),
  createCategoryFilter({ label: 'Grants', value: 'Grants' }),
  createCategoryFilter({ label: 'Builder', value: 'Builder' }),
  createCategoryFilter({ label: 'Wave 4', value: 'Wave 4' }),
  createCategoryFilter({ label: 'Wave 5', value: 'Wave 5' }),
  createCategoryFilter({ label: 'March-25', value: 'March-25' }),
  createMilestoneFilter({ label: 'Grant - all milestones', value: MILESTONE_SEPARATOR }),
  createMilestoneFilter({ label: 'Grants - milestone 1', value: `${MILESTONE_SEPARATOR}1` }),
  createMilestoneFilter({ label: 'Grants - milestone 2', value: `${MILESTONE_SEPARATOR}2` }),
  createMilestoneFilter({ label: 'Grants - milestone 3', value: `${MILESTONE_SEPARATOR}3` }),
]

export const filterOptions = {
  [FilterType.CATEGORY]: filterCategoryOptions,
  // Add more filter types here
}
