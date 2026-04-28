import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'

import { fetchRewardDistributionFinished } from '@/app/collective-rewards/actions'
import { type BackersManagerAbi, getAbi } from '@/lib/abis/tok'
import { BackersManagerAddress } from '@/lib/contracts'

export type RewardDistributionFinishedEventLog = ReturnType<
  typeof parseEventLogs<BackersManagerAbi, true, 'RewardDistributionFinished'>
>

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
    initialData: [],
  })

  return {
    data,
    error,
    isLoading,
  }
}
