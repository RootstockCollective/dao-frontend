import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Address } from 'viem'

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

export const useGetBackerStakingHistoryWithStateSync = (backer: Address) => {
  const { data, isLoading, error } = useQuery<BackerStakingHistory, Error>({
    queryFn: async () => {
      const response = await fetch(`/api/backers/${backer}/metrics/rbi/context`)

      if (!response.ok) {
        throw new Error('Failed to fetch backer staking history')
      }

      return response.json()
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

export const useGetBackerStakingHistoryWithGraph = (backer: Address) => {
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      const { data } = await axios.get<BackerStakingHistory>(`/api/backers/${backer}/metrics/rbi`)
      return data
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
