import { MILESTONE_SEPARATOR } from '@/app/proposals/shared/utils'
import { FilterItem, FilterType } from './types'
import { Proposal } from '../../shared/types'
import { ProposalState } from '@/shared/types'
import moment from 'moment'

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

const createCategoryFilter = (value: string, isAll?: boolean): FilterItem => ({
  id: `category-${value}-${Date.now()}`,
  type: FilterType.CATEGORY,
  label: value,
  value,
  isAll,
  validate: (proposal: Proposal) => {
    return isAll || proposal.category?.toLowerCase().includes(value.toLowerCase())
  },
})

const createMilestoneFilter = (label: string, value: string): FilterItem => ({
  id: `milestone-${value}-${Date.now()}`,
  type: FilterType.CATEGORY,
  label,
  value,
  validate: (proposal: Proposal) => {
    return proposal.description?.toLowerCase().includes(value.toLowerCase())
  },
})

const createStatusFilter = (label: string, value: ProposalState, isAll?: boolean): FilterItem => {
  return {
    id: `status-${label}-${Date.now()}`,
    type: FilterType.STATUS,
    label,
    value: value.toString(),
    isAll,
    validate: (proposal: Proposal) => {
      return isAll || proposal.proposalState === value
    },
  }
}

const createTimeFilter = (label: string, days: number, isAll?: boolean): FilterItem => ({
  id: `time-${label}-${Date.now()}`,
  type: FilterType.TIME,
  label,
  value: label.toLowerCase(),
  exclusive: true,
  isAll,
  validate: (proposal: Proposal) => {
    if (isAll) {
      return true
    }

    if (!proposal.Starts) {
      return false
    }

    const now = moment()
    return now.diff(proposal.Starts, 'days') <= days
  },
})
const filterCategoryOptions: FilterItem[] = [
  createCategoryFilter('All categories', true),
  createCategoryFilter('Grants'),
  createCategoryFilter('Builder'),
  createCategoryFilter('Wave 4'),
  createCategoryFilter('Wave 5'),
  createCategoryFilter('March-25'),
  createMilestoneFilter('Grant - all milestones', MILESTONE_SEPARATOR),
  createMilestoneFilter('Grants - milestone 1', `${MILESTONE_SEPARATOR}1`),
  createMilestoneFilter('Grants - milestone 2', `${MILESTONE_SEPARATOR}2`),
  createMilestoneFilter('Grants - milestone 3', `${MILESTONE_SEPARATOR}3`),
]

const filterStatusOptions: FilterItem[] = [
  createStatusFilter('All statuses', ProposalState.None, true),
  createStatusFilter('Pending', ProposalState.Pending),
  createStatusFilter('Active', ProposalState.Active),
  createStatusFilter('Executed', ProposalState.Executed),
  createStatusFilter('Defeated', ProposalState.Defeated),
]

const filterTimeOptions: FilterItem[] = [
  createTimeFilter('All proposals', 0, true),
  createTimeFilter('Last week', 7),
  createTimeFilter('Last month', 30),
  createTimeFilter('Last 90 days', 90),
]

export const filterOptions: Record<string, FilterItem[]> = {
  [FilterType.CATEGORY]: filterCategoryOptions,
  [FilterType.STATUS]: filterStatusOptions,
  [FilterType.TIME]: filterTimeOptions,
}
