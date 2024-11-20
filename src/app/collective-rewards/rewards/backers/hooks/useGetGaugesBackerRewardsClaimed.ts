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

      if (events.length > 0) {
        acc[key] = events
      }
      return acc
    }, {})
  }, [eventsData, rewardToken, backer])

  return {
    data,
    isLoading,
    error,
  }
}
