import { useQuery } from '@tanstack/react-query'
import { fetchRewardDistributionFinished } from '@/app/collective-rewards/actions'
import { parseEventLogs } from 'viem'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export type RewardDistributionFinishedEventLog = ReturnType<
  typeof parseEventLogs<typeof BackersManagerAbi, true, 'RewardDistributionFinished'>
>

export const useGetRewardDistributionFinishedLogs = () => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributionFinished()

      return parseEventLogs({
        abi: BackersManagerAbi,
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
