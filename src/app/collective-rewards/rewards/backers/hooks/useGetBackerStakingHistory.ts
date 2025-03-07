import { AVERAGE_BLOCKTIME, THE_GRAPH_URL } from '@/lib/constants'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

type Response = {
  data: {
    backerStakingHistory: BackerStakingHistory
  }
}

export type BackerStakingHistory = {
  id: Address
  backerTotalAllocation_: string
  accumulatedTime_: string
  lastBlockTimestamp_: string
  gauges_: GaugeStakingHistory[]
}

export type GaugeStakingHistory = {
  allocation_: string
  gauge_: Address
  accumulatedAllocationsTime_: string
  lastBlockTimestamp_: string
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

export const useGetBackerStakingHistory = (backer: Address) => {
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      const {
        data: {
          data: { backerStakingHistory },
        },
      } = await axios.post<Response>(THE_GRAPH_URL, {
        query,
        variables: {
          backer,
        },
      })

      return backerStakingHistory
    },
    queryKey: ['backerStakingHistory', backer],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return {
    data,
    isLoading,
    error,
  }
}
