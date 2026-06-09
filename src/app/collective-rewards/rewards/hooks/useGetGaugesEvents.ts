import { useQuery } from '@tanstack/react-query'
import { AbiEvent, Address, parseEventLogs, RpcLog } from 'viem'

import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

type EventEntry = Extract<(typeof GaugeAbi)[number], AbiEvent>
type EventName = Extract<
  EventEntry['name'],
  'NotifyReward' | 'BackerRewardsClaimed' | 'BuilderRewardsClaimed'
>
type GaugeEventLog<T extends EventName> = ReturnType<typeof parseEventLogs<typeof GaugeAbi, true, T>>

const eventRoutes: Record<EventName, string> = {
  NotifyReward: '/api/gauges/notify-reward',
  BackerRewardsClaimed: '/api/gauges/backer-rewards-claimed',
  BuilderRewardsClaimed: '/api/gauges/builder-rewards-claimed',
}

export const useGetGaugesEvents = <T extends EventName>(gauges: Address[], eventName: T, enabled = true) => {
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      const url = `${eventRoutes[eventName]}?gauges=${gauges.join(',')}`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to fetch ${eventName} logs: ${res.status} ${res.statusText}`)
      }

      const eventsByGauge = (await res.json()) as Record<Address, RpcLog[]>

      return gauges.reduce<Record<Address, GaugeEventLog<T>>>((acc, gauge) => {
        const rawLogs = eventsByGauge[gauge] ?? []
        acc[gauge] = parseEventLogs({
          abi: GaugeAbi,
          logs: rawLogs,
          eventName,
        }) as GaugeEventLog<T>
        return acc
      }, {})
    },
    queryKey: ['useGetGaugesEvents', eventName, gauges],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: enabled && gauges.length > 0,
  })

  return {
    data,
    isLoading,
    error,
  }
}
