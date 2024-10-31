import { describe, test, expect } from 'vitest'
import { ProposalState } from '@/shared/types'
import { getMostAdvancedProposal } from '@/app/collective-rewards/utils/getMostAdvancedProposal'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'

describe('getValidProposal', () => {
  describe('whitelisted builder', () => {
    test('should return the latest executed proposal', () => {
      const proposal = getMostAdvancedProposal(
        {
          address: '0x01',
          status: 'Whitelisted',
          proposals: [
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
        },
        {
          1: ProposalState.Executed,
          2: ProposalState.Active,
        },
      )

      expect(proposal).not.toBeUndefined()
      expect(proposal?.args.proposalId).toBe(1n)
    })

    test('should return null if there are no executed proposals', () => {
      const proposal = getMostAdvancedProposal(
        {
          address: '0x01',
          status: 'Whitelisted',
          proposals: [
            {
              timeStamp: 1,
              args: {
                proposalId: 1n,
              },
            },
          ] as CreateBuilderProposalEventLog[],
        },
        {
          1: ProposalState.Active,
        },
      )

      expect(proposal).toBeUndefined()
    })
  })

  describe('builder in progress', () => {
    test('should return the latest not executed proposal', () => {
      const proposal = getMostAdvancedProposal(
        {
          address: '0x01',
          status: 'In progress',
          proposals: [
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
        },
        {
          1: ProposalState.Active,
          2: ProposalState.Executed,
        },
      )

      expect(proposal).not.toBeUndefined()
      expect(proposal?.args.proposalId).toBe(1n)
    })

    test('should return null if there are no valid proposals', () => {
      const proposal = getMostAdvancedProposal(
        {
          address: '0x01',
          status: 'In progress',
          proposals: [
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
        },
        {
          1: ProposalState.Canceled,
          2: ProposalState.Executed,
        },
      )

      expect(proposal).toBeUndefined()
    })
  })
})
