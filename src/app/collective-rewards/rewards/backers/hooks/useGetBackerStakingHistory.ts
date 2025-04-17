import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { fetchBackerStakingHistory } from '@/app/collective-rewards/rewards'

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

export const useGetBackerStakingHistory = (backer: Address) => {
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
