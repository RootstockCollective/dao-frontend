import { gql } from '@apollo/client'

export const GET_PROPOSALS = gql`
  query GetProposals {
    proposals(first: 1000, orderDirection: desc, orderBy: createdAt) {
      id
      proposalId
      proposer {
        id
      }
      targets
      description
      votesFor
      votesAgainst
      votesAbstains
      voteEnd
      voteStart
      quorum
      createdAt
      createdAtBlock
      description
      signatures
      values
      calldatas
      state
    }
    counters {
      id
      count
    }
  }
`

export interface GraphQLResponse {
  data: {
    proposals: ProposalGraphQLResponse[]
    counters: Counter[]
  }
}

type ProposalState =
  | 'Pending'
  | 'Active'
  | 'Canceled'
  | 'Defeated'
  | 'Succeeded'
  | 'Queued'
  | 'Expired'
  | 'Executed'

export interface ProposalGraphQLResponse {
  id: string
  proposalId: string
  proposer: {
    id: string
  }
  targets: string[]
  description: string
  votesFor: string
  votesAgainst: string
  votesAbstains: string
  voteEnd: string
  voteStart: string
  quorum: string
  createdAt: string
  createdAtBlock: string
  signatures: string[]
  values: string[]
  calldatas: string[]
  state: ProposalState
}

interface Counter {
  id: string
  count: string
}
