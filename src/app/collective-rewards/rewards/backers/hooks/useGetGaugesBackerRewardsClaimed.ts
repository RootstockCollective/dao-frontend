import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

const ROUTE = '/api/gauges/backer-rewards-claimed'

/**
 * A claim as the client consumes it.
 *
 * Shaped like the `parseEventLogs` output this used to be built from, so the components that
 * reduce over `args.amount_` did not have to change. `amount_` arrives as a decimal string —
 * JSON has no bigint — and is converted here, once, rather than at each call site.
 */
export interface BackerRewardsClaimedEvent {
  args: {
    backer_: Address
    rewardToken_: Address
    amount_: bigint
  }
  timeStamp: number
}

interface BackerRewardsClaimedEventDto {
  args: { backer_: Address; rewardToken_: Address; amount_: string }
  timeStamp: number
}

export const useGetGaugesBackerRewardsClaimed = (
  gauges: Address[],
  rewardToken?: Address,
  backer?: Address,
) => {
  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery({
    queryFn: async (): Promise<Record<Address, BackerRewardsClaimedEvent[]>> => {
      if (gauges.length === 0) {
        return {}
      }

      const res = await fetch(`${ROUTE}?gauges=${gauges.join(',')}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch BackerRewardsClaimed: ${res.status} ${res.statusText}`)
      }

      const dto = (await res.json()) as Record<Address, BackerRewardsClaimedEventDto[]>

      return gauges.reduce<Record<Address, BackerRewardsClaimedEvent[]>>((acc, gauge) => {
        acc[gauge] = (dto[gauge] ?? []).map(({ args, timeStamp }) => ({
          args: { ...args, amount_: BigInt(args.amount_) },
          timeStamp,
        }))
        return acc
      }, {})
    },
    queryKey: ['useGetGaugesBackerRewardsClaimed', gauges],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  const data = useMemo(() => {
    if (!eventsData) {
      return {}
    }

    return Object.keys(eventsData).reduce((acc: { [key: string]: BackerRewardsClaimedEvent[] }, key) => {
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
