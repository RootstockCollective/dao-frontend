'use server'

import { BackerStakingHistory } from '@/app/my-rewards/backers/hooks'
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

export async function fetchBackerStakingHistory(backer: Address) {
  const { data } = await client.query<Response>({
    query,
    variables: {
      backer,
    },
  })
  return data.backerStakingHistory
}
