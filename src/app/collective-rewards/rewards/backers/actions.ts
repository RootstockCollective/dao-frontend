'use server'

import { Address } from 'viem'
import { BackerStakingHistory } from '@/app/collective-rewards/rewards'
import { fetchCrTheGraphEndpoint } from '@/lib/the-graph'
import { makeClient } from '@/shared/components/ApolloClient'
import { gql } from '@apollo/client'

type Response = {
  backerStakingHistory?: BackerStakingHistory
}

const query = gql`
  query ($backer: Bytes) {
    backerStakingHistory(id: $backer) {
      id
      backerTotalAllocation_
      accumulatedTime_
      lastBlockTimestamp_
      gauges_ {
        gauge_
        accumulatedAllocationsTime_
        allocation_
        lastBlockTimestamp_
      }
    }
  }
`

const client = makeClient(fetchCrTheGraphEndpoint)
export async function fetchBackerStakingHistory(backer: Address) {
  const { data } = await client.query<Response>({
    query,
    variables: {
      backer,
    },
  })
  return data.backerStakingHistory
}
