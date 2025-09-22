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
  delegators: number // flattened ids
  votes: number
  createdAt: string
}
