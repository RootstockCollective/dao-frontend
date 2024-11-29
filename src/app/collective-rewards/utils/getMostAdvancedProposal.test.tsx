import { describe, test, expect } from 'vitest'
import { ProposalState } from '@/shared/types'
import { getMostAdvancedProposal } from '@/app/collective-rewards/utils'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { BuilderStateFlags } from '@/app/collective-rewards/types'

describe('getMostAdvancedProposal', () => {
  describe('v1', () => {
    test('should return the latest executed proposal', () => {
      const proposal = getMostAdvancedProposal(
        [
          {
            timeStamp: 1,
            args: {
              proposalId: 1n,
            },
          },
          {
            timeStamp: 2,
            args: {
              proposalId: 2n,
            },
          },
        ] as CreateBuilderProposalEventLog[],
        {
          1: ProposalState.Executed,
          2: ProposalState.Active,
        },
      )

      expect(proposal).not.toBeUndefined()
      expect(proposal?.args.proposalId).toBe(1n)
    })

    test('should return the latest valid proposal', () => {
      const proposal = getMostAdvancedProposal(
        [
          {
            timeStamp: 1,
            args: {
              proposalId: 1n,
            },
          },
          {
            timeStamp: 2,
            args: {
              proposalId: 2n,
            },
          },
        ] as CreateBuilderProposalEventLog[],
        {
          1: ProposalState.Active,
          2: ProposalState.Expired,
        },
      )

      expect(proposal).not.toBeUndefined()
      expect(proposal?.args.proposalId).toBe(1n)
    })

    test('should return null if there are no executed/valid proposals', () => {
      const proposal = getMostAdvancedProposal(
        [
          {
            timeStamp: 1,
            args: {
              proposalId: 1n,
            },
          },
        ] as CreateBuilderProposalEventLog[],
        {
          1: ProposalState.Defeated,
        },
      )

      expect(proposal).toBeUndefined()
    })
  })

  describe('v2', () => {
    test('should return the latest executed proposal when the builder is active', () => {
      const proposal = getMostAdvancedProposal(
        [
          {
            timeStamp: 1,
            args: {
              proposalId: 1n,
            },
          },
          {
            timeStamp: 2,
            args: {
              proposalId: 2n,
            },
          },
        ] as CreateBuilderProposalEventLog[],
        {
          1: ProposalState.Active,
          2: ProposalState.Executed,
        },
        { activated: true, communityApproved: true } as BuilderStateFlags,
      )
      expect(proposal).not.toBeUndefined()
      expect(proposal?.args.proposalId).toBe(2n)
    })

    // This scenario is could happen if by any chance the proposal was executed but it failed
    test('should return the latest not executed proposal', () => {
      const proposal = getMostAdvancedProposal(
        [
          {
            timeStamp: 1,
            args: {
              proposalId: 1n,
            },
          },
          {
            timeStamp: 2,
            args: {
              proposalId: 2n,
            },
          },
        ] as CreateBuilderProposalEventLog[],
        {
          1: ProposalState.Active,
          2: ProposalState.Executed,
        },
        { activated: false, communityApproved: false } as BuilderStateFlags,
      )
      expect(proposal).not.toBeUndefined()
      expect(proposal?.args.proposalId).toBe(1n)
    })

    test('should return null if there are no valid proposals', () => {
      const proposal = getMostAdvancedProposal(
        [
          {
            timeStamp: 1,
            args: {
              proposalId: 1n,
            },
          },
          {
            timeStamp: 1,
            args: {
              proposalId: 2n,
            },
          },
        ] as CreateBuilderProposalEventLog[],
        {
          1: ProposalState.Canceled,
          2: ProposalState.Executed,
        },
        { activated: false, communityApproved: false } as BuilderStateFlags,
      )

      expect(proposal).toBeUndefined()
    })
  })
})
