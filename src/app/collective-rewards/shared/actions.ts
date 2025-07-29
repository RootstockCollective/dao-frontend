'use server'

import { client } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { AbiData } from './hooks/useGetABI'

const query = apolloGQL`
  query AbiMetricsData {
    builders(
      where: { state_: { initialized: true } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      id
      totalAllocation
      backerRewardPercentage {
        id
        next
        previous
        cooldownEndTime
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      id
      rewardsERC20
      rewardsRBTC
    }
  }
`

export async function fetchABIData() {
  const { data: abiData } = await client.query<AbiData>({ query })

  return abiData
}
