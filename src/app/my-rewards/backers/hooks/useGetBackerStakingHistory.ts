import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { fetchBackerStakingHistory } from '@/app/actions/rbi/fetchBackerStakingHistory'

export type BackerStakingHistory = {
  id: Address
  backerTotalAllocation: string
  accumulatedTime: string
  lastBlockTimestamp: string
  gauges: GaugeStakingHistory[]
}

export type GaugeStakingHistory = {
  allocation: string
  gauge: Address
  accumulatedAllocationsTime: string
  lastBlockTimestamp: string
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
    queryFn: () => fetchBackerStakingHistory(backer),
    queryKey: ['backerStakingHistory', backer],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return {
    data,
    isLoading,
    error,
  }
}
