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
    cycles(first: 1, orderBy: currentCycleStart, orderDirection: desc) {
      id
      rewards: rewardsAmount {
        amount
        token
      }
    }
  }
`

type RewardsAmount = {
  amount: string
  token: string
}

type CycleData = {
  id: string
  rewards: RewardsAmount[]
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
      rewards: Object.fromEntries(cycle.rewards.map(r => [r.token, r.amount])),
    })),
  }
}

export const getCachedABIData = unstable_cache(fetchABIData, ['cached_abi_data'], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: ['cached_abi_data'],
})
