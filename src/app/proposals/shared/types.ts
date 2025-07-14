import Big from '@/lib/big'
import { DecodedData } from '@/app/proposals/shared/utils'
import { ProposalCategory, ProposalState } from '@/shared/types'
import { type GrantProposal } from '../new/create/schemas/GrantProposalSchema'
import { type ActivationProposal } from '../new/create/schemas/ActivationProposalSchema'
import { type DeactivationProposal } from '../new/create/schemas/DeactivationProposalSchema'
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

export type ProposalRecord =
  | { type: ProposalCategory.Grants; form: GrantProposal }
  | { type: ProposalCategory.Activation; form: ActivationProposal }
  | { type: ProposalCategory.Deactivation; form: DeactivationProposal }

export type { GrantProposal, ActivationProposal, DeactivationProposal }