import { BuilderStateFlags, ProposalsToState } from '@/app/collective-rewards/types'
import { CreateBuilderProposalEventLog, CrEventByIdMap } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'

const inactiveProposalsStates = [ProposalState.Canceled, ProposalState.Defeated, ProposalState.Expired]
const isActive = (state: ProposalState) => !inactiveProposalsStates.includes(state)
const isBuilderActive = (status?: BuilderStateFlags) => !status || status.activated

export const getMostAdvancedProposal = (
  status: BuilderStateFlags,
  proposalsStateMap: ProposalsToState,
  proposalsEvent: CrEventByIdMap,
): CreateBuilderProposalEventLog | undefined => {
  return Object.values(proposalsEvent)
    .sort(({ timeStamp: a }, { timeStamp: b }) => b - a)
    .find(({ args: { proposalId } }) => {
      const state = proposalsStateMap[proposalId.toString()]

      const isExecuted = ProposalState.Executed === state
      if (isBuilderActive(status)) {
        return isExecuted
      }

      return !isExecuted && isActive(state)
    })
}
