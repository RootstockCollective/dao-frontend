import { fetchRewardDistributionFinished } from '@/app/collective-rewards/actions'
import { type BackersManagerAbi, getAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'

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
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: [],
  })

  return {
    data,
    error,
    isLoading,
  }
}
