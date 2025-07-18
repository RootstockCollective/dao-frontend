import Big from '@/lib/big'
import { DecodedData } from '@/app/proposals/shared/utils'
import { ProposalCategory, ProposalState } from '@/shared/types'
import { type GrantProposal } from '../new/details/schemas/GrantProposalSchema'
import { type ActivationProposal } from '../new/details/schemas/ActivationProposalSchema'
import { type DeactivationProposal } from '../new/details/schemas/DeactivationProposalSchema'
export interface Proposal {
  votes: {
    againstVotes: Big
    forVotes: Big
    abstainVotes: Big
    quorum: Big
  }
  blocksUntilClosure: Big
  votingPeriod: Big
  quorumAtSnapshot: Big
  proposalDeadline: Big
  proposalState: ProposalState
  category: ProposalCategory
  name: string
  proposer: `0x${string}`
  description: string
  proposalId: string
  Starts: moment.Moment
  calldatasParsed: DecodedData[]
  blockNumber: string
}

// discriminated union
export type ProposalRecord =
  | { category: ProposalCategory.Grants; form: GrantProposal }
  | { category: ProposalCategory.Activation; form: ActivationProposal }
  | { category: ProposalCategory.Deactivation; form: DeactivationProposal }

export type { GrantProposal, ActivationProposal, DeactivationProposal }
