'use server'

import { BackerStakingHistory } from '@/app/collective-rewards/rewards'
import { client } from '@/shared/components/ApolloClient'
import { gql } from '@apollo/client'
import { Address } from 'viem'

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

export async function fetchBackerStakingHistory(backer: Address) {
  const { data } = await client.query<Response>({
    query,
    variables: {
      backer,
    },
  })
  return data.backerStakingHistory
}
