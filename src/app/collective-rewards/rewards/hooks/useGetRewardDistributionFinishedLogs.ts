import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'

import { fetchRewardDistributionFinished } from '@/app/collective-rewards/actions'
import { type BackersManagerAbi, getAbi } from '@/lib/abis/tok'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'

export type RewardDistributionFinishedEventLog = ReturnType<
  typeof parseEventLogs<BackersManagerAbi, true, 'RewardDistributionFinished'>
>

/**
 * Returned while the query has no data. A constant rather than `initialData`, which marks the query
 * as already succeeded: `isLoading` would never be true, and the last-cycle window would read "no
 * distribution this cycle" until Blockscout answered, rendering zero rewards as if loaded.
 */
const NO_LOGS: RewardDistributionFinishedEventLog = []

export const useGetRewardDistributionFinishedLogs = () => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributionFinished()

      return parseEventLogs({
        abi: getAbi('BackersManagerAbi'),
        logs: data,
        eventName: 'RewardDistributionFinished',
      })
    },
    queryKey: ['RewardDistributionFinished', BackersManagerAddress],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return {
    data: data ?? NO_LOGS,
    error,
    isLoading,
  }
}
