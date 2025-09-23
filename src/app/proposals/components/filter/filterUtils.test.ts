import {
  filterProposals,
  applySearchFilters,
  applyCategoryFilters,
  applyStatusFilters,
  applyTimeFilters,
} from './filterUtils'
import { Proposal } from '@/app/proposals/shared/types'
import { ProposalCategory, ProposalState } from '@/shared/types'
import { FilterItem, FilterType } from './types'
import moment from 'moment'
import { expect } from 'vitest'

// Mock proposal data for testing
const mockProposals: Proposal[] = [
  {
    name: 'Test Proposal 1',
    description: 'This is a test proposal for grants',
    category: ProposalCategory.Grants,
    proposalState: ProposalState.Active,
    proposer: '0x123' as `0x${string}`,
    proposalId: '1',
    Starts: moment().subtract(5, 'days'), // 5 days ago
    votes: {
      againstVotes: { toString: () => '0' } as any,
      forVotes: { toString: () => '100' } as any,
      abstainVotes: { toString: () => '0' } as any,
      quorum: { toString: () => '100' } as any,
    },
    blocksUntilClosure: { toString: () => '1000' } as any,
    votingPeriod: { toString: () => '10000' } as any,
    quorumAtSnapshot: { toString: () => '100' } as any,
    proposalDeadline: { toString: () => '2000' } as any,
    calldatasParsed: [],
    blockNumber: '12345',
  },
  {
    name: 'Test Proposal 2',
    description: 'This is a builder proposal',
    category: ProposalCategory.Activation,
    proposalState: ProposalState.Executed,
    proposer: '0x456' as `0x${string}`,
    proposalId: '2',
    Starts: moment().subtract(2, 'weeks'), // 2 weeks ago
    votes: {
      againstVotes: { toString: () => '0' } as any,
      forVotes: { toString: () => '200' } as any,
      abstainVotes: { toString: () => '0' } as any,
      quorum: { toString: () => '200' } as any,
    },
    blocksUntilClosure: { toString: () => '0' } as any,
    votingPeriod: { toString: () => '10000' } as any,
    quorumAtSnapshot: { toString: () => '200' } as any,
    proposalDeadline: { toString: () => '2000' } as any,
    calldatasParsed: [],
    blockNumber: '12346',
  },
  {
    name: 'Wave 4 Proposal',
    description: 'This is a Wave 4 proposal',
    category: ProposalCategory.Grants,
    proposalState: ProposalState.Pending,
    proposer: '0x789' as `0x${string}`,
    proposalId: '3',
    Starts: moment().subtract(1, 'month'), // 1 month ago
    votes: {
      againstVotes: { toString: () => '0' } as any,
      forVotes: { toString: () => '50' } as any,
      abstainVotes: { toString: () => '0' } as any,
      quorum: { toString: () => '50' } as any,
    },
    blocksUntilClosure: { toString: () => '500' } as any,
    votingPeriod: { toString: () => '10000' } as any,
    quorumAtSnapshot: { toString: () => '50' } as any,
    proposalDeadline: { toString: () => '2000' } as any,
    calldatasParsed: [],
    blockNumber: '12347',
  },
]

describe('Filter Utils', () => {
  describe('applySearchFilters', () => {
    it('should filter proposals by name', () => {
      const searchFilters: FilterItem[] = [{ id: '1', type: FilterType.SEARCH, label: 'Test', value: 'Test' }]
      const result = applySearchFilters(mockProposals, searchFilters)
      expect(result).toHaveLength(2) // Test Proposal 1 and Test Proposal 2
    })

    it('should filter proposals by description', () => {
      const searchFilters: FilterItem[] = [
        { id: '1', type: FilterType.SEARCH, label: 'grants', value: 'grants' },
      ]
      const result = applySearchFilters(mockProposals, searchFilters)
      expect(result).toHaveLength(2) // Test Proposal 1 and Wave 4 Proposal
    })

    it('should return all proposals when no search filters', () => {
      const result = applySearchFilters(mockProposals, [])
      expect(result).toHaveLength(3)
    })
  })

  describe('applyCategoryFilters', () => {
    it('should filter proposals by category', () => {
      const categoryFilters: FilterItem[] = [
        { id: '1', type: FilterType.CATEGORY, label: 'Grants', value: 'Grants' },
      ]
      const result = applyCategoryFilters(mockProposals, categoryFilters)
      expect(result).toHaveLength(2) // Test Proposal 1 and Wave 4 Proposal
    })

    it('should filter proposals by builder category', () => {
      const categoryFilters: FilterItem[] = [
        { id: '1', type: FilterType.CATEGORY, label: 'Activation', value: 'Activation' },
      ]
      const result = applyCategoryFilters(mockProposals, categoryFilters)
      expect(result).toHaveLength(1) // Test Proposal 2
    })
  })

  describe('applyStatusFilters', () => {
    it('should filter proposals by status', () => {
      const statusFilters: FilterItem[] = [
        { id: '1', type: FilterType.STATUS, label: 'Active', value: 'Active' },
      ]
      const result = applyStatusFilters(mockProposals, statusFilters)
      expect(result).toHaveLength(1) // Test Proposal 1
    })

    it('should filter proposals by executed status', () => {
      const statusFilters: FilterItem[] = [
        { id: '1', type: FilterType.STATUS, label: 'Executed', value: 'Executed' },
      ]
      const result = applyStatusFilters(mockProposals, statusFilters)
      expect(result).toHaveLength(1) // Test Proposal 2
    })
  })

  describe('applyTimeFilters', () => {
    it('should filter proposals by last week', () => {
      const timeFilters: FilterItem[] = [
        { id: '1', type: FilterType.TIME, label: 'Last week', value: 'last-week' },
      ]
      const result = applyTimeFilters(mockProposals, timeFilters)
      expect(result).toHaveLength(1) // Test Proposal 1 (5 days ago)
    })

    it('should filter proposals by Wave 4', () => {
      const timeFilters: FilterItem[] = [{ id: '1', type: FilterType.TIME, label: 'Wave 4', value: 'Wave 4' }]
      const result = applyTimeFilters(mockProposals, timeFilters)
      expect(result).toHaveLength(1) // Wave 4 Proposal
    })
  })

  describe('filterProposals', () => {
    it('should apply multiple filter types with AND logic', () => {
      const activeFilters: FilterItem[] = [
        { id: '1', type: FilterType.SEARCH, label: 'Test', value: 'Test' },
        { id: '2', type: FilterType.CATEGORY, label: 'Grants', value: 'Grants' },
        { id: '3', type: FilterType.STATUS, label: 'Active', value: 'Active' },
      ]
      const result = filterProposals(mockProposals, activeFilters)
      expect(result).toHaveLength(1) // Only Test Proposal 1 matches all criteria
    })

    it('should return all proposals when no filters', () => {
      const result = filterProposals(mockProposals, [])
      expect(result).toHaveLength(3)
    })
  })
})
