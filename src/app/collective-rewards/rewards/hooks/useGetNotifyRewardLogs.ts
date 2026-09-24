import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, getAddress } from 'viem'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

import {
  fetchGaugesNotifyReward,
  type GaugeNotifyRewardEventLog,
  isNotifyRewardWindowReady,
  matchesNotifyRewardFilter,
  type NotifyRewardEvent,
} from './useGetGaugesNotifyReward'

type GaugeNotifyRewardsPerToken = Record<Address, GaugeNotifyRewardEventLog>

/**
 * Returned while the query has no data. A constant rather than `initialData`, which marks the query
 * as already succeeded — `isLoading` would never be true and the page would paint zero rewards.
 */
const NO_EVENTS: NotifyRewardEvent[] = []

/** One gauge's `NotifyReward` events grouped by reward token, through the same route as the table. */
export const useGetGaugeNotifyRewardLogs = (
  gauge: Address,
  rewardToken?: Address,
  fromTimestamp?: number,
  toTimestamp?: number,
) => {
  const {
    data: eventsByGauge,
    error,
    isLoading,
  } = useQuery({
    queryFn: () => fetchGaugesNotifyReward([gauge], fromTimestamp),
    queryKey: ['useGetGaugeNotifyRewardLogs', gauge, fromTimestamp],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: isNotifyRewardWindowReady(fromTimestamp),
  })

  const events = eventsByGauge?.[gauge] ?? NO_EVENTS

  const data = useMemo(() => {
    const rewardTokens = rewardToken ? [rewardToken] : undefined

    return events.reduce<GaugeNotifyRewardsPerToken>((acc, event) => {
      if (!matchesNotifyRewardFilter(event, { rewardTokens, fromTimestamp, toTimestamp })) {
        return acc
      }

      const rewardTokenAddress = getAddress(event.args.rewardToken_)
      acc[rewardTokenAddress] = [...(acc[rewardTokenAddress] || []), event]
      return acc
    }, {})
  }, [events, rewardToken, fromTimestamp, toTimestamp])

  return {
    data,
    error,
    isLoading,
  }
}
