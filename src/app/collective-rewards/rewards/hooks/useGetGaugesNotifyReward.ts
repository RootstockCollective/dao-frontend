import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

import { GaugeNotifyRewardEventLog, useGetGaugesEvents } from '@/app/collective-rewards/rewards'

export type NotifyRewardEvent = GaugeNotifyRewardEventLog[number] & { timeStamp: number }
export type UseGetGaugesNotifyRewardReturnType = Record<Address, NotifyRewardEvent[]>

export interface UseGetGaugesNotifyRewardParams {
  gauges: Address[]
  rewardTokens?: Address[]
  fromTimestamp?: number
  toTimestamp?: number
  enabled?: boolean
}

export const useGetGaugesNotifyReward = ({
  gauges,
  rewardTokens,
  fromTimestamp,
  toTimestamp,
  enabled = true,
}: UseGetGaugesNotifyRewardParams) => {
  const { data: eventsPerGauge, isLoading, error } = useGetGaugesEvents(gauges, 'NotifyReward', enabled)

  const data: UseGetGaugesNotifyRewardReturnType = useMemo(() => {
    return gauges.reduce<UseGetGaugesNotifyRewardReturnType>((acc, gauge) => {
      if (!eventsPerGauge) {
        return {
          ...acc,
          [gauge]: [],
        }
      }
      let events = eventsPerGauge[gauge] as NotifyRewardEvent[]

      return {
        ...acc,
        [gauge]: events.filter(event => {
          if (rewardTokens && !rewardTokens.some(token => isAddressEqual(event.args.rewardToken_, token))) {
            return false
          }
          if (fromTimestamp && event.timeStamp < fromTimestamp) {
            return false
          }
          if (toTimestamp && event.timeStamp > toTimestamp) {
            return false
          }

          return true
        }),
      }
    }, {})
  }, [eventsPerGauge, rewardTokens, fromTimestamp, toTimestamp, gauges])

  return {
    data,
    isLoading,
    error,
  }
}
