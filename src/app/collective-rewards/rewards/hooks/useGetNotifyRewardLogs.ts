import { useQuery } from '@tanstack/react-query'
import { fetchGaugeNotifyRewardLogs, fetchNotifyRewardLogs } from '@/app/collective-rewards/actions'
import { Address, getAddress, parseEventLogs } from 'viem'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export type NotifyRewardEventLog = ReturnType<
  typeof parseEventLogs<typeof BackersManagerAbi, true, 'NotifyReward'>
>

export type NotifyRewardsPerToken = Record<Address, NotifyRewardEventLog>

export const useGetNotifyRewardLogs = () => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchNotifyRewardLogs()

      const events = parseEventLogs({
        abi: BackersManagerAbi,
        logs: data,
        eventName: 'NotifyReward',
      })

      return events.reduce<NotifyRewardsPerToken>((acc, log) => {
        const rewardToken = getAddress(log.args.rewardToken_)
        acc[rewardToken] = [...(acc[rewardToken] || []), log]
        return acc
      }, {})
    },
    queryKey: ['notifyRewardLogs', BackersManagerAddress],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: {},
  })

  return {
    data,
    error,
    isLoading,
  }
}

export type GaugeNotifyRewardEventLog = ReturnType<
  typeof parseEventLogs<typeof GaugeAbi, true, 'NotifyReward'>
>
export type GaugeNotifyRewardsPerToken = Record<Address, GaugeNotifyRewardEventLog>

export const useGetGaugeNotifyRewardLogs = (gauge: Address) => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchGaugeNotifyRewardLogs(gauge)

      const events = parseEventLogs({
        abi: GaugeAbi,
        logs: data,
        eventName: 'NotifyReward',
      })

      return events.reduce<GaugeNotifyRewardsPerToken>((acc, log) => {
        const rewardToken = getAddress(log.args.rewardToken_)
        acc[rewardToken] = [...(acc[rewardToken] || []), log]
        return acc
      }, {})
    },
    queryKey: ['notifyRewardLogs', gauge],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: {},
  })

  return {
    data,
    error,
    isLoading,
  }
}
