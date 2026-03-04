import { gql as apolloGQL } from '@apollo/client'
import { cacheLife, cacheTag } from 'next/cache'

import { CACHE_REVALIDATE_SECONDS } from '@/lib/constants'
import { client } from '@/shared/components/ApolloClient'

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
      currentCycleStart
      rewardPerToken {
        amount
        token
      }
    }
  }
`

interface RewardPerToken {
  amount: string
  token: string
}

interface CycleData {
  id: string
  currentCycleStart: number
  rewardPerToken: RewardPerToken[]
}

export interface ResponseABIData {
  builders: BuilderData[]
  cycles: CycleData[]
}
async function fetchABIData() {
  const { data } = await client.query<ResponseABIData>({ query })
  if (!data) {
    throw new Error('Failed to fetch ABI data from subgraph')
  }

  return {
    builders: data.builders,
    cycles: data.cycles.map(cycle => ({
      ...cycle,
      rewardPerToken: Object.fromEntries(cycle.rewardPerToken.map(r => [r.token, r.amount])),
    })),
  }
}

/** Fetches builders and reward cycles from the Collective Rewards subgraph (cached). */
export async function getCachedABIData() {
  'use cache'
  cacheLife({ revalidate: CACHE_REVALIDATE_SECONDS })
  cacheTag('cached_abi_data')
  return fetchABIData()
}
