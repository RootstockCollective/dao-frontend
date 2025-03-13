'use server'

import axios from 'axios'
import { Address } from 'viem'
import { BackerStakingHistory } from '@/app/collective-rewards/rewards'

type Response = {
  data: {
    backerStakingHistory?: BackerStakingHistory
  }
}

const query = `
    query($backer: Bytes){
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

const fetchCrTheGraphEndpoint = `${process.env.THE_GRAPH_URL}/${process.env.THE_GRAPH_API_KEY}/${process.env.THE_GRAPH_ID}`
export async function fetchBackerStakingHistory(backer: Address) {
  const {
    data: { data },
  } = await axios.post<Response>(fetchCrTheGraphEndpoint, {
    query,
    variables: {
      backer,
    },
  })

  return data.backerStakingHistory
}
