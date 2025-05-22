'use server'

import { fetchCrTheGraphEndpoint } from '@/lib/the-graph'
import { makeClient } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { Address } from 'viem'

type CycleData = {
  id: string
  rewardsERC20: string
  rewardsRBTC: string
}

type BackerRewardPercentageData = {
  id: string
  next: string
  previous: string
  cooldownEndTime: string
}

type BuilderData = {
  id: Address
  backerRewardPercentage: BackerRewardPercentageData
  rewardShares: string
  totalAllocation: string
}

type Response = {
  builders: BuilderData[]
  cycles: CycleData[]
}

const abiQuery = apolloGQL`
  query AbiMetricsData {
    builders(
      where: { state_: { kycApproved: true, communityApproved: true, initialized: true, selfPaused: false } }
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
const client = makeClient(fetchCrTheGraphEndpoint)

export async function fetchABIData() {
  const { data: abiData } = await client.query<Response>({ query: abiQuery })

  return abiData
}
