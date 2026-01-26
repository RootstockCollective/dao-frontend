'use server'

import { client } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { unstable_cache } from 'next/cache'
import { CACHE_REVALIDATE_SECONDS } from '@/lib/constants'
import { BuilderData } from '../hooks/useGetABI'

const query = apolloGQL`
  query AbiMetricsData {
    builders(
      where: {state_: {initialized: true}}
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
        initialized
        kycApproved
        kycPaused
        selfPaused
      }
    }
    cycles(orderBy: currentCycleStart, orderDirection: desc) {
      id
      rewardPerToken {
        amount
        token
      }
    }
  }
`

type RewardPerToken = {
  amount: string
  token: string
}

type CycleData = {
  id: string
  rewardPerToken: RewardPerToken[]
}

export type ResponseABIData = {
  builders: BuilderData[]
  cycles: CycleData[]
}
async function fetchABIData() {
  const { data } = await client.query<ResponseABIData>({ query })

  return {
    builders: data.builders,
    cycles: data.cycles.map(cycle => ({
      ...cycle,
      rewardPerToken: Object.fromEntries(cycle.rewardPerToken.map(r => [r.token, r.amount])),
    })),
  }
}

export const getCachedABIData = unstable_cache(fetchABIData, ['cached_abi_data'], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: ['cached_abi_data'],
})
