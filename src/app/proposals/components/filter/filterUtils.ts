import { Proposal } from '@/app/proposals/shared/types'
import { FilterItem } from './types'
import { ProposalState } from '@/shared/types'
import { MILESTONE_SEPARATOR } from '../../shared/utils'

/**
 * Applies search filters to proposals
 * @param proposals - Array of proposals to filter
 * @param searchFilters - Array of search filter items
 * @returns Filtered proposals that match search criteria
 */
export const applySearchFilters = (proposals: Proposal[], searchFilters: FilterItem[]): Proposal[] => {
  if (searchFilters.length === 0) return proposals

  return proposals.filter(proposal => {
    return searchFilters.some(searchFilter => {
      const lowered = searchFilter.value.toLowerCase()
      return [
        proposal.name,
        proposal.description,
        proposal.category,
        proposal.proposer,
        proposal.proposalId,
      ].some(param => param?.toLowerCase()?.includes(lowered))
    })
  })
}

/**
 * Applies category filters to proposals
 * @param proposals - Array of proposals to filter
 * @param categoryFilters - Array of category filter items
 * @returns Filtered proposals that match category criteria
 */
export const applyCategoryFilters = (proposals: Proposal[], categoryFilters: FilterItem[]): Proposal[] => {
  if (categoryFilters.length === 0) return proposals

  return proposals.filter(proposal => {
    return categoryFilters.some(categoryFilter => {
      const filterValue = categoryFilter.value

      // Special case for milestone-related filters - check description
      if (filterValue === MILESTONE_SEPARATOR || filterValue.startsWith(MILESTONE_SEPARATOR)) {
        return proposal.description?.toLowerCase().includes(filterValue.toLowerCase())
      }

      // For all other category filters, only check the category field
      return proposal.category?.toLowerCase()?.includes(filterValue.toLowerCase())
    })
  })
}

/**
 * Applies status filters to proposals
 * @param proposals - Array of proposals to filter
 * @param statusFilters - Array of status filter items
 * @returns Filtered proposals that match status criteria
 */
export const applyStatusFilters = (proposals: Proposal[], statusFilters: FilterItem[]): Proposal[] => {
  if (statusFilters.length === 0) return proposals

  return proposals.filter(proposal => {
    return statusFilters.some(statusFilter => {
      const status = statusFilter.value
      return (
        proposal.proposalState !== undefined &&
        ProposalState[proposal.proposalState]?.toLowerCase() === status.toLowerCase()
      )
    })
  })
}

/**
 * Applies time filters to proposals
 * @param proposals - Array of proposals to filter
 * @param timeFilters - Array of time filter items
 * @returns Filtered proposals that match time criteria
 */
export const applyTimeFilters = (proposals: Proposal[], timeFilters: FilterItem[]): Proposal[] => {
  if (timeFilters.length === 0) return proposals

  return proposals.filter(proposal => {
    return timeFilters.some(timeFilter => {
      const filterValue = timeFilter.value
      const now = new Date()

      switch (filterValue) {
        case 'last-week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          // Use proposal.Starts (moment object) instead of proposal.createdAt
          return proposal.Starts ? proposal.Starts.toDate() >= weekAgo : false
        case 'last-month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return proposal.Starts ? proposal.Starts.toDate() >= monthAgo : false
        case 'last-90-days':
          const days90Ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          return proposal.Starts ? proposal.Starts.toDate() >= days90Ago : false
        case 'Wave 4':
        case 'Wave 5':
        case 'March-25':
          // For wave filters, check if the proposal name or description contains the wave
          return (
            proposal.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
            proposal.description?.toLowerCase().includes(filterValue.toLowerCase())
          )
        default:
          return true
      }
    })
  })
}

/**
 * Main filtering function that applies all filter types to proposals
 * @param proposals - Array of proposals to filter
 * @param activeFilters - Array of all active filter items
 * @returns Filtered proposals that match all filter criteria
 */
export const filterProposals = (proposals: Proposal[], activeFilters: FilterItem[]): Proposal[] => {
  // Separate filters by type
  const searchFilters = activeFilters.filter(f => f.type === 'search')
  const categoryFilters = activeFilters.filter(f => f.type === 'category' && f.value)
  const statusFilters = activeFilters.filter(f => f.type === 'status' && f.value)
  const timeFilters = activeFilters.filter(f => f.type === 'time' && f.value)

  // Apply filters sequentially (AND logic between filter types)
  let filteredProposals = proposals

  // Apply search filters
  filteredProposals = applySearchFilters(filteredProposals, searchFilters)

  // Apply category filters
  filteredProposals = applyCategoryFilters(filteredProposals, categoryFilters)

  // Apply status filters
  filteredProposals = applyStatusFilters(filteredProposals, statusFilters)

  // Apply time filters
  filteredProposals = applyTimeFilters(filteredProposals, timeFilters)

  return filteredProposals
}
