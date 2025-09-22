import { daoClient } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { Contributor, ContributorGraphResponse, Delegator } from '@/app/api/contributors/v1/types'

export const revalidate = 60

export async function GET() {
  const { contributors } = await fetchContributors()
  return Response.json(
    contributors.map(({ id, account, createdAt }: Contributor) => {
      return {
        id,
        delegatedVotes: account.delegatedVotes,
        delegators: account.delegators.length,
        votes: account.VoteCasts.length,
        createdAt,
      }
    }),
  )
}

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
