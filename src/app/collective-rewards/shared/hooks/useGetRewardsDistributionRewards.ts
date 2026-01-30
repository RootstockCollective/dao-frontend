import { fetchRewardDistributionRewards } from '@/app/collective-rewards/actions'
import { type BackersManagerAbi, getAbi } from '@/lib/abis/tok'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'

export type RewardDistributionRewardsEventLog = ReturnType<
  typeof parseEventLogs<BackersManagerAbi, true, 'RewardDistributionRewards'>
>

export const useGetRewardDistributionRewardsLogs = () => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributionRewards()

      return parseEventLogs({
        abi: getAbi('BackersManagerAbi'),
        logs: data,
        eventName: 'RewardDistributionRewards',
      })
    },
    queryKey: ['RewardDistributionRewards', BackersManagerAddress],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: [],
  })

  return {
    data,
    error,
    isLoading,
  }
}
