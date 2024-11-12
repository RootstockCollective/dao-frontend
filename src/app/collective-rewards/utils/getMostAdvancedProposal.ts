import {
  BuilderInfo,
  BuilderStatus,
  BuilderStatusActive,
  ProposalsToState,
} from '@/app/collective-rewards/types'
import { ProposalState } from '@/shared/types'

const inactiveProposalsStates = [ProposalState.Canceled, ProposalState.Defeated, ProposalState.Expired]
const isActive = (state: ProposalState) => !inactiveProposalsStates.includes(state)
const isBuilderActive = (builderStatus: BuilderStatus) => BuilderStatusActive === builderStatus

export const getMostAdvancedProposal = (
  { status, proposals }: BuilderInfo,
  proposalsStateMap: ProposalsToState,
) => {
  return proposals
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
