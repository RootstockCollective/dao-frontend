'use server'

import { gql as apolloGQL } from '@apollo/client'

import { ContributorGraphResponse } from '@/app/proposals/shared/types'
import { daoClient } from '@/shared/components/ApolloClient'

// The Graph caps nested collections at 100 unless `first` is set; 1000 is its maximum
const GRAPH_MAX_PAGE_SIZE = 1000

const query = apolloGQL`
  query GetContributors {
    contributors(first: ${GRAPH_MAX_PAGE_SIZE}, orderBy: nftId, orderDirection: desc) {
    id
    account {
        delegatedVotes
        delegators(first: ${GRAPH_MAX_PAGE_SIZE}) {
            id
        }
        VoteCasts(first: ${GRAPH_MAX_PAGE_SIZE}) {
            id
        }
    }
    createdAt
  }
}
`

/** Fetches all contributors with their delegation data from the DAO subgraph. */
export async function fetchContributors(): Promise<ContributorGraphResponse> {
  const { data } = await daoClient.query<ContributorGraphResponse>({ query, fetchPolicy: 'no-cache' })
  if (!data) {
    throw new Error('Failed to fetch contributors from subgraph')
  }
  return data
}

const delegatedVotesQuery = apolloGQL`
  query GetDelegatedVotes($first: Int!, $after: ID!) {
    accounts(
      first: $first
      where: { delegatedVotes_gt: "0", id_gt: $after }
      orderBy: id
      orderDirection: asc
    ) {
      id
      delegatedVotes
    }
  }
`

interface DelegatedVotesResponse {
  accounts: { id: string; delegatedVotes: string }[]
}

/** Sums the voting power delegated to every account, paging by `id` cursor. */
export async function fetchTotalDelegatedVotes(): Promise<bigint> {
  let total = 0n
  let after = ''
  for (;;) {
    const { data } = await daoClient.query<DelegatedVotesResponse>({
      query: delegatedVotesQuery,
      variables: { first: GRAPH_MAX_PAGE_SIZE, after },
      fetchPolicy: 'no-cache',
    })
    if (!data) {
      throw new Error('Failed to fetch delegated votes from subgraph')
    }
    for (const { delegatedVotes } of data.accounts) {
      total += BigInt(delegatedVotes)
    }
    if (data.accounts.length < GRAPH_MAX_PAGE_SIZE) return total
    after = data.accounts[data.accounts.length - 1].id
  }
}
