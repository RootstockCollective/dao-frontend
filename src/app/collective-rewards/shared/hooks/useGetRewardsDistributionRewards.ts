import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'

import { fetchRewardDistributionRewards } from '@/app/collective-rewards/actions'
import { type BackersManagerAbi, getAbi } from '@/lib/abis/tok'
import { BackersManagerAddress } from '@/lib/contracts'

export type RewardDistributionRewardsEventLog = ReturnType<
  typeof parseEventLogs<BackersManagerAbi, true, 'RewardDistributionRewards'>
>
type Log = RewardDistributionRewardsEventLog[number] & { timeStamp: number }
export const useGetRewardDistributionRewardsLogs = () => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributionRewards()

      return parseEventLogs({
        abi: getAbi('BackersManagerAbi'),
        logs: data,
        eventName: 'RewardDistributionRewards',
      }) as Log[]
    },
    queryKey: ['RewardDistributionRewards', BackersManagerAddress],
    initialData: [],
  })

  return {
    data,
    error,
    isLoading,
  }
}
