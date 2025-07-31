import { Address, isAddressEqual } from 'viem'
import { useMemo } from 'react'
import { useGetGaugesEvents, GaugeNotifyRewardEventLog } from '@/app/hooks'

export const useGetGaugesNotifyReward = (
  gauges: Address[],
  rewardToken?: Address,
  fromTimestamp?: number,
  toTimestamp?: number,
) => {
  const { data: eventsData, isLoading, error } = useGetGaugesEvents(gauges, 'NotifyReward')

  type Log = GaugeNotifyRewardEventLog[number]
  const data = useMemo(() => {
    if (!eventsData) {
      return {}
    }

    return Object.keys(eventsData).reduce((acc: { [key: string]: (typeof eventsData)[Address] }, key) => {
      let events = eventsData[key as Address] as (Log & { timeStamp: number })[]
      if (rewardToken) {
        events = events.filter(event => isAddressEqual(event.args.rewardToken_, rewardToken))
      }
      if (fromTimestamp) {
        events = events.filter(event => {
          return event.timeStamp >= fromTimestamp
        })
      }
      if (toTimestamp) {
        events = events.filter(event => {
          return event.timeStamp <= toTimestamp
        })
      }

      if (events.length > 0) {
        acc[key] = events
      }
      return acc
    }, {})
  }, [eventsData, rewardToken, fromTimestamp, toTimestamp])

  return {
    data,
    isLoading,
    error,
  }
}
