import Big from '@/lib/big'
import { Address } from 'viem'
import { SerializedDecodedData } from '@/app/proposals/shared/utils'
import { ProposalCategory, ProposalState } from '@/shared/types'

import { type GrantProposal } from '../../new/details/schemas/GrantProposalSchema'
import { type ActivationProposal } from '../../new/details/schemas/ActivationProposalSchema'
import { type DeactivationProposal } from '../../new/details/schemas/DeactivationProposalSchema'
import { CountdownProps } from '@/components/Countdown'

// Base proposal input type that covers all sources (GraphQL, DB, Node)
export interface BaseProposalInput {
  proposalId: string
  description: string
  votesFor: string | null
  votesAgainst: string | null
  votesAbstains: string | null
  voteEnd: string
  voteStart: string
  createdAt: string
  createdAtBlock: string
  state: string | null
  targets: string[]
  values: string[]
  calldatas: string[]
  proposer: Address | { id: Address } // Can be Address (DB) or object (GraphQL)
  quorum?: string | bigint | null
}

// Transform functions for building proposals from different sources
export interface ProposalTransformFunctions {
  parseTargets: (targets: string[]) => string[]
  parseCalldatas: (calldatas: string[]) => string[]
  proposerTransform: (proposer: Address | { id: Address }) => Address
}

export interface Proposal {
  votes: {
    againstVotes: Big
    forVotes: Big
    abstainVotes: Big
    quorumReached: Big
  }
  blocksUntilClosure: Big
  votingPeriod: Big
  quorumAtSnapshot: Big
  proposalDeadline: Big
  proposalState: ProposalState
  category: ProposalCategory
  name: string
  proposer: Address
  description: string
  proposalId: string
  Starts: moment.Moment
  calldatasParsed: SerializedDecodedData[]
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
  quorumReached?: string
  // Fields from getProposalEventArguments
  fullProposalName?: string
}

export interface Eta extends Omit<CountdownProps, 'className'> {
  type: 'vote end in' | 'queue ends in'
}

export interface ProposalApiResponse {
  blockNumber: string
  calldatasParsed: SerializedDecodedData[]
  category: ProposalCategory
  description: string
  name: string
  proposalDeadline: string
  proposalId: string
  proposer: Address
  Starts: string
  voteStart: string
  voteEnd: string
  votingPeriod: string
  blocksUntilClosure?: string
  proposalState?: string
  quorumAtSnapshot?: string
  votes?: {
    againstVotes: string
    forVotes: string
    abstainVotes: string
  }
}

// discriminated union
export type ProposalRecord =
  | { category: ProposalCategory.Grants; form: GrantProposal }
  | { category: ProposalCategory.Activation; form: ActivationProposal }
  | { category: ProposalCategory.Deactivation; form: DeactivationProposal }

export enum ProposalType {
  Grant = 'grant',
  Activation = 'activation',
  Deactivation = 'deactivation',
}

export enum Milestones {
  MILESTONE_1 = '1',
  MILESTONE_2 = '2',
  MILESTONE_3 = '3',
  NO_MILESTONE = '0',
}

export interface Delegator {
  id: string
}

interface VoteCast {
  id: string
}

interface Account {
  delegatedVotes: string
  delegators: Delegator[]
  VoteCasts: VoteCast[]
}

export interface Contributor {
  id: string
  account: Account
  createdAt: string
  nftId: string
}

export interface ContributorGraphResponse {
  contributors: Contributor[]
}

export interface ContributorApiResponse {
  id: string
  delegatedVotes: string
  delegators: number
  votes: number
  createdAt: string
}
