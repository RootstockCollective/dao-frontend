'use server'

import { BackerStakingHistory } from '@/app/collective-rewards/rewards'
import { client } from '@/shared/components/ApolloClient'
import { gql } from '@apollo/client'
import { Address } from 'viem'

interface Response {
  backerStakingHistory?: BackerStakingHistory
}

const query = gql`
  query ($backer: Bytes) {
    backerStakingHistory(id: $backer) {
      id
      backerTotalAllocation
      accumulatedTime
      lastBlockTimestamp
      gauges {
        gauge
        accumulatedAllocationsTime
        allocation
        lastBlockTimestamp
      }
    }
  }
`

/**
 * Fetches staking history for a backer from the Collective Rewards subgraph.
 * @param backer - On-chain address of the backer
 * @returns Staking history or `undefined` if the backer has no history
 */
export async function fetchBackerStakingHistory(backer: Address) {
  const { data } = await client.query<Response>({
    query,
    variables: {
      backer,
    },
  })
  return data?.backerStakingHistory
}
