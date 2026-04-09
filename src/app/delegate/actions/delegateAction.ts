'use server'

import { gql as apolloGQL } from '@apollo/client'

import { ContributorGraphResponse } from '@/app/proposals/shared/types'
import { daoClient } from '@/shared/components/ApolloClient'

const query = apolloGQL`
  query GetContributors {
    contributors(first: 1000, orderBy: nftId, orderDirection: desc) {
    id
    account {
        delegatedVotes
        delegators {
            id
        }
        VoteCasts {
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
