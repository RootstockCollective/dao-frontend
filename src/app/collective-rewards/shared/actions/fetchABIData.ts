'use server'

import { client } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { AbiData } from '../hooks/useGetABI'
import { unstable_cache } from 'next/cache'
import { AVERAGE_BLOCKTIME, CACHE_REVALIDATE_SECONDS } from '@/lib/constants'

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

async function fetchABIData() {
  const { data } = await client.query<AbiData>({ query })

  return data
}

export const getCachedABIData = unstable_cache(fetchABIData, ['cached_abi_data'], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: ['cached_abi_data'],
})
