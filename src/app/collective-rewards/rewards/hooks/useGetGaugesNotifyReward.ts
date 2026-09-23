import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

const ROUTE = '/api/gauges/notify-reward'

/**
 * A `NotifyReward` event as the client consumes it.
 *
 * Shaped like the `parseEventLogs` output this used to be built from, so the reducers over
 * `args.builderAmount_` / `args.backersAmount_` did not have to change. The amounts arrive as
 * decimal strings — JSON has no bigint — and are converted here, once.
 */
export interface NotifyRewardEvent {
  args: {
    rewardToken_: Address
    builderAmount_: bigint
    backersAmount_: bigint
  }
  timeStamp: number
}

export type GaugeNotifyRewardEventLog = NotifyRewardEvent[]
export type UseGetGaugesNotifyRewardReturnType = Record<Address, NotifyRewardEvent[]>

interface NotifyRewardEventDto {
  args: { rewardToken_: Address; builderAmount_: string; backersAmount_: string }
  timeStamp: number
}

/** Fetches every `NotifyReward` per gauge from state-sync, keyed by the gauges as passed. */
export const fetchGaugesNotifyReward = async (
  gauges: Address[],
): Promise<UseGetGaugesNotifyRewardReturnType> => {
  if (gauges.length === 0) {
    return {}
  }

  const res = await fetch(`${ROUTE}?gauges=${gauges.join(',')}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch NotifyReward events: ${res.status} ${res.statusText}`)
  }

  const dto = (await res.json()) as Record<Address, NotifyRewardEventDto[]>

  return gauges.reduce<UseGetGaugesNotifyRewardReturnType>((acc, gauge) => {
    acc[gauge] = (dto[gauge] ?? []).map(({ args, timeStamp }) => ({
      args: {
        rewardToken_: args.rewardToken_,
        builderAmount_: BigInt(args.builderAmount_),
        backersAmount_: BigInt(args.backersAmount_),
      },
      timeStamp,
    }))
    return acc
  }, {})
}

/** Whether an event falls inside the optional token and time filters shared by both hooks. */
export const matchesNotifyRewardFilter = (
  event: NotifyRewardEvent,
  { rewardTokens, fromTimestamp, toTimestamp }: Omit<UseGetGaugesNotifyRewardParams, 'gauges'>,
): boolean => {
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
}

export interface UseGetGaugesNotifyRewardParams {
  gauges: Address[]
  rewardTokens?: Address[]
  fromTimestamp?: number
  toTimestamp?: number
}

export const useGetGaugesNotifyReward = ({
  gauges,
  rewardTokens,
  fromTimestamp,
  toTimestamp,
}: UseGetGaugesNotifyRewardParams) => {
  const {
    data: eventsPerGauge,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => fetchGaugesNotifyReward(gauges),
    queryKey: ['useGetGaugesNotifyReward', gauges],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  const data: UseGetGaugesNotifyRewardReturnType = useMemo(() => {
    return gauges.reduce<UseGetGaugesNotifyRewardReturnType>((acc, gauge) => {
      acc[gauge] = (eventsPerGauge?.[gauge] ?? []).filter(event =>
        matchesNotifyRewardFilter(event, { rewardTokens, fromTimestamp, toTimestamp }),
      )
      return acc
    }, {})
  }, [eventsPerGauge, rewardTokens, fromTimestamp, toTimestamp, gauges])

  return {
    data,
    isLoading,
    error,
  }
}
