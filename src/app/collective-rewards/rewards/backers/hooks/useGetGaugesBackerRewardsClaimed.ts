import { Address, isAddressEqual, parseEventLogs } from 'viem'
import { useGetGaugesEvents } from '@/app/collective-rewards/rewards'
import { useMemo } from 'react'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'

export type BackerRewardsClaimedEventLog = ReturnType<
  typeof parseEventLogs<typeof GaugeAbi, true, 'BackerRewardsClaimed'>
>

export const useGetGaugesBackerRewardsClaimed = (
  gauges: Address[],
  rewardToken?: Address,
  backer?: Address,
  fromTimestamp?: number,
  toTimestamp?: number,
) => {
  const { data: eventsData, isLoading, error } = useGetGaugesEvents(gauges, 'BackerRewardsClaimed')

  const data = useMemo(() => {
    return Object.keys(eventsData).reduce((acc: { [key: string]: (typeof eventsData)[Address] }, key) => {
      let events = eventsData[key as Address]
      if (backer) {
        events = events.filter(event => isAddressEqual(event.args.backer_, backer))
      }
      if (rewardToken) {
        events = events.filter(event => isAddressEqual(event.args.rewardToken_, rewardToken))
      }
      if (fromTimestamp) {
        events = events.filter(event => {
          // @ts-ignore
          return event.timestamp >= fromTimestamp
        })
      }
      if (toTimestamp) {
        events = events.filter(event => {
          // @ts-ignore
          return event.timestamp <= toTimestamp
        })
      }

      if (events.length > 0) {
        acc[key] = events
      }
      return acc
    }, {})
  }, [eventsData, rewardToken, backer, fromTimestamp, toTimestamp])

  return {
    data,
    isLoading,
    error,
  }
}
