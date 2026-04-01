import { fetchGaugeNotifyRewardLogs } from '@/app/collective-rewards/actions'
import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, getAddress, isAddressEqual, parseEventLogs } from 'viem'

export type GaugeNotifyRewardEventLog = ReturnType<
  typeof parseEventLogs<typeof GaugeAbi, true, 'NotifyReward'>
>
type GaugeNotifyRewardsPerToken = Record<Address, GaugeNotifyRewardEventLog>

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
