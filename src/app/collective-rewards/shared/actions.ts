'use server'

import { client } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { AbiData } from './hooks/useGetABI'

// TODO: Update flags after migration
const query = apolloGQL`
  query AbiMetricsData {
    builders(
      where: { state_: { initialized: true } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      address: id
      totalAllocation
      backerRewardPct: backerRewardPercentage {
        next
        previous
        cooldownEndTime
      }
      stateFlags: state {
        communityApproved
        activated: initialized
        kycApproved
        paused: kycPaused
        revoked: selfPaused
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
