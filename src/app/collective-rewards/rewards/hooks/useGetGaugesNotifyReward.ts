import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

import type { NotifyRewardByGauge } from '@/app/api/gauges/notify-reward/stateSync'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

const ROUTE = '/api/gauges/notify-reward'

/**
 * A `NotifyReward` event as the client consumes it.
 *
 * Shaped like the `parseEventLogs` output this used to be built from, so the reducers over
 * `args.builderAmount_` / `args.backersAmount_` did not have to change. The route sends the amounts
 * as decimal strings — JSON has no bigint — and they are converted here, once.
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

/**
 * Fetches `NotifyReward` per gauge from state-sync, keyed by the gauges as passed.
 *
 * @param fromTimestamp — Inclusive lower bound in seconds, applied by the route so a poll does not
 *   carry each gauge's whole history. `0` or omitted means no bound, as in {@link matchesNotifyRewardFilter}.
 */
export const fetchGaugesNotifyReward = async (
  gauges: Address[],
  fromTimestamp?: number,
): Promise<UseGetGaugesNotifyRewardReturnType> => {
  if (gauges.length === 0) {
    return {}
  }

  const params = new URLSearchParams({ gauges: gauges.join(',') })
  if (fromTimestamp) {
    // The route takes whole seconds; flooring can only widen the window, and the filter trims it.
    params.set('fromTimestamp', String(Math.floor(fromTimestamp)))
  }

  const res = await fetch(`${ROUTE}?${params}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch NotifyReward events: ${res.status} ${res.statusText}`)
  }

  const dto = (await res.json()) as NotifyRewardByGauge

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
  /**
   * Inclusive lower bound in seconds; omitted means the whole history. `0` is the placeholder
   * `useGetLastCycleDistribution` returns while the cycle loads, so the hooks wait instead of
   * fetching every gauge's full history only to discard it a moment later.
   */
  fromTimestamp?: number
  toTimestamp?: number
}

/** See {@link UseGetGaugesNotifyRewardParams.fromTimestamp}. */
export const isNotifyRewardWindowReady = (fromTimestamp: number | undefined): boolean => fromTimestamp !== 0

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
    queryFn: () => fetchGaugesNotifyReward(gauges, fromTimestamp),
    queryKey: ['useGetGaugesNotifyReward', gauges, fromTimestamp],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: isNotifyRewardWindowReady(fromTimestamp),
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
