import Big from '@/lib/big'
import { DecodedData, getProposalEventArguments } from '@/app/proposals/shared/utils'
import { ProposalCategory, ProposalState } from '@/shared/types'
import { type GrantProposal } from '../new/details/schemas/GrantProposalSchema'
import { type ActivationProposal } from '../new/details/schemas/ActivationProposalSchema'
import { type DeactivationProposal } from '../new/details/schemas/DeactivationProposalSchema'
import { CountdownProps } from '@/components/Countdown'

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
  // Fields from GraphQL proposal object (optional for backend API proposals)
  createdAt?: string
  createdAtBlock?: string
  voteStart?: string
  voteEnd?: string
  targets?: string[]
  values?: string[]
  calldatas?: string[]
  votesAgainst?: string
  votesFor?: string
  votesAbstains?: string
  quorum?: string
  // Fields from getProposalEventArguments
  fullProposalName?: string
}

export interface Eta extends Omit<CountdownProps, 'className'> {
  type: 'vote end in' | 'queue ends in'
}

export type ProposalApiResponse = {
  blockNumber: string
  calldatasParsed: any[]
  category: string
  description: string
  name: string
  proposalDeadline: string
  proposalId: string
  proposer: `0x${string}`
  Starts: string
  blocksUntilClosure?: string
  votingPeriod: string
  proposalState?: string
  quorumAtSnapshot?: string
  votes?: {
    againstVotes: string
    forVotes: string
    abstainVotes: string
    quorum: string
  }
}

// discriminated union
export type ProposalRecord =
  | { category: ProposalCategory.Grants; form: GrantProposal }
  | { category: ProposalCategory.Activation; form: ActivationProposal }
  | { category: ProposalCategory.Deactivation; form: DeactivationProposal }
