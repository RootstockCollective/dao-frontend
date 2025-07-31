import { fetchGaugeNotifyRewardLogs, fetchNotifyRewardLogs } from '@/app/collective-rewards/actions'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, getAddress, isAddressEqual, parseEventLogs } from 'viem'

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

export const useGetGaugeNotifyRewardLogs = (
  gauge: Address,
  rewardToken?: Address,
  fromTimestamp?: number,
  toTimestamp?: number,
) => {
  const {
    data: events,
    error,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      const { data } = await fetchGaugeNotifyRewardLogs(gauge)

      return parseEventLogs({
        abi: GaugeAbi,
        logs: data,
        eventName: 'NotifyReward',
      })
    },
    queryKey: ['notifyRewardLogs', gauge],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: [],
  })

  type Log = GaugeNotifyRewardEventLog[number]
  const data = useMemo(() => {
    return events.reduce<GaugeNotifyRewardsPerToken>((acc, log) => {
      const {
        timeStamp,
        args: { rewardToken_ },
      } = log as Log & { timeStamp: number }
      const rewardTokenAddress = getAddress(rewardToken_)

      if (rewardToken && !isAddressEqual(rewardToken, rewardTokenAddress)) {
        return acc
      }

      if (fromTimestamp && timeStamp < fromTimestamp) {
        return acc
      }

      if (toTimestamp && timeStamp > toTimestamp) {
        return acc
      }

      acc[rewardTokenAddress] = [...(acc[rewardTokenAddress] || []), log]
      return acc
    }, {})
  }, [events, rewardToken, fromTimestamp, toTimestamp])

  return {
    data,
    error,
    isLoading,
  }
}
