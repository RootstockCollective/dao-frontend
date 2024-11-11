import { useQuery } from '@tanstack/react-query'
import { fetchNotifyRewardLogs } from '@/app/collective-rewards/actions'
import { Address, getAddress, parseEventLogs } from 'viem'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export type NotifyRewardEventLog = ReturnType<typeof parseEventLogs<typeof GaugeAbi, true, 'NotifyReward'>>

export type NotifyRewardsPerToken = Record<Address, NotifyRewardEventLog>

export const useGetNotifyRewardLogs = (gauge?: Address) => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchNotifyRewardLogs(gauge!)

      const events = parseEventLogs({
        abi: GaugeAbi,
        logs: data,
        eventName: 'NotifyReward',
      })

      return events.reduce<NotifyRewardsPerToken>((acc, log) => {
        const rewardToken = getAddress(log.args.rewardToken_)
        acc[rewardToken] = [...(acc[rewardToken] || []), log]

        return acc
      }, {})
    },
    queryKey: ['notifyRewardLogs'],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: {},
  })

  return {
    data,
    error,
    isLoading,
  }
}
