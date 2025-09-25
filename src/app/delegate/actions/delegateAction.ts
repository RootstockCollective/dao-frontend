'use server'

import { daoClient } from '@/shared/components/ApolloClient'
import { ContributorGraphResponse } from '@/app/proposals/shared/types'
import { gql as apolloGQL } from '@apollo/client'

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

export async function fetchContributors(): Promise<ContributorGraphResponse> {
  const { data } = await daoClient.query<ContributorGraphResponse>({ query, fetchPolicy: 'no-cache' })
  return data
}
