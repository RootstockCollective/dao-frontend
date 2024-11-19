import { AbiEvent, Address, parseEventLogs } from 'viem'
import {
  fetchBackerRewardsClaimed,
  fetchBuilderRewardsClaimed,
  fetchGaugeNotifyRewardLogs,
} from '@/app/collective-rewards/actions'
import { useQuery } from '@tanstack/react-query'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'

type EventEntry = Extract<(typeof GaugeAbi)[number], AbiEvent>
type EventName = Extract<
  EventEntry['name'],
  'NotifyReward' | 'BackerRewardsClaimed' | 'BuilderRewardsClaimed'
>
type GaugeEventLog<T extends EventName> = ReturnType<typeof parseEventLogs<typeof GaugeAbi, true, T>>

const eventFetchers: Record<EventName, Function> = {
  BackerRewardsClaimed: fetchBackerRewardsClaimed,
  NotifyReward: fetchGaugeNotifyRewardLogs,
  BuilderRewardsClaimed: fetchBuilderRewardsClaimed,
}

export const useGetGaugesEvents = <T extends EventName>(gauges: Address[], eventName: T) => {
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      const values = await Promise.all(gauges.map(gauge => eventFetchers[eventName](gauge)))
      return values.reduce<Record<Address, GaugeEventLog<T>>>((acc, { data }, index) => {
        const events = parseEventLogs({
          abi: GaugeAbi,
          logs: data,
          eventName,
        })

        acc[gauges[index]] = events
        return acc
      }, {})
    },
    queryKey: ['useGetGaugesEvents', eventName],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: {},
  })

  return {
    data,
    isLoading,
    error,
  }
}
