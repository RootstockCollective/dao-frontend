import { Address, isAddressEqual } from 'viem'
import { useMemo } from 'react'
import { useGetGaugesEvents } from '@/app/collective-rewards/rewards'

export const useGetGaugesNotifyReward = (gauges: Address[], rewardToken?: Address) => {
  const { data: eventsData, isLoading, error } = useGetGaugesEvents(gauges, 'NotifyReward')

  const data = useMemo(() => {
    return Object.keys(eventsData).reduce((acc: { [key: string]: (typeof eventsData)[Address] }, key) => {
      let events = eventsData[key as Address]
      if (rewardToken) {
        events = events.filter(event => isAddressEqual(event.args.rewardToken_, rewardToken))
      }

      if (events.length > 0) {
        acc[key] = events
      }
      return acc
    }, {})
  }, [eventsData, rewardToken])

  return {
    data,
    isLoading,
    error,
  }
}
