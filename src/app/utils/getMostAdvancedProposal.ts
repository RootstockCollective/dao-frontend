import { BuilderStateFlags, ProposalsToState } from '@/app/types'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'

const inactiveProposalsStates = [ProposalState.Canceled, ProposalState.Defeated, ProposalState.Expired]
const isActive = (state: ProposalState) => !inactiveProposalsStates.includes(state)
const isBuilderActive = (stateFlags?: BuilderStateFlags) =>
  !stateFlags || stateFlags.activated || stateFlags.communityApproved

export const getMostAdvancedProposal = (
  proposalsEvent: CreateBuilderProposalEventLog[],
  proposalsStateMap: ProposalsToState,
  status?: BuilderStateFlags,
): CreateBuilderProposalEventLog | undefined => {
  return proposalsEvent
    .sort(
      ({ timeStamp: a, args: { proposalId: pA } }, { timeStamp: b, args: { proposalId: pB } }) =>
        proposalsStateMap[pB.toString()] - proposalsStateMap[pA.toString()] || b - a,
    )
    .find(({ args: { proposalId } }) => {
      const state = proposalsStateMap[proposalId.toString()]

      if (state === ProposalState.Executed) {
        return isBuilderActive(status)
      }

      return isActive(state)
    })
}
