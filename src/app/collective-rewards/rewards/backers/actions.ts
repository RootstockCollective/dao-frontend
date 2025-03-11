'use server'

import axios from 'axios'
import { Address } from 'viem'
import { BackerStakingHistory } from '@/app/collective-rewards/rewards'
import { fetchCrTheGraphEndpoint } from '@/lib/endpoints'

type Response = {
  data: {
    backerStakingHistory: BackerStakingHistory
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

export async function fetchBackerStakingHistory(backer: Address) {
  const {
    data: {
      data: { backerStakingHistory },
    },
  } = await axios.post<Response>(fetchCrTheGraphEndpoint, {
    query,
    variables: {
      backer,
    },
  })

  return backerStakingHistory
}
