'use client'

import { useQuery } from '@tanstack/react-query'
import { Address, getAddress } from 'viem'

import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

import { useGetGaugesBackerRewardsClaimed } from './useGetGaugesBackerRewardsClaimed'

export type ClaimedRewards = Record<Address, bigint>

interface DbBackerRewardsClaimed {
  id: string
  token: string
  amount: string
  builder: string
}

function normalizeDbData(
  data: DbBackerRewardsClaimed[],
  builderToGauge: Map<Address, Address>,
): ClaimedRewards {
  return data.reduce<ClaimedRewards>((acc, item) => {
    const gauge = builderToGauge.get(getAddress(item.builder))
    if (!gauge) return acc
    acc[gauge] = (acc[gauge] ?? 0n) + BigInt(item.amount)
    return acc
  }, {})
}

function normalizeEventData(
  eventData: Record<Address, ReturnType<typeof Array.prototype.flat>>,
): ClaimedRewards {
  return Object.entries(eventData).reduce<ClaimedRewards>((acc, [gauge, events]) => {
    acc[gauge as Address] = (events as { args: { amount_: bigint } }[]).reduce(
      (sum, event) => sum + event.args.amount_,
      0n,
    )
    return acc
  }, {})
}

/**
 * Fetches backer rewards claimed with a health-check-gated fallback chain:
 *   1. DB  (StateSync healthy)  → /api/backers/[backer]/rewards-claimed
 *   2. The Graph  (slot reserved — add its own enabled condition when ready)
 *   3. Blockscout event logs  (StateSync unhealthy)
 *
 * Output is always Record<gaugeAddress, totalClaimedAmount> for the given token.
 */
export const useGetBackerRewardsClaimed = (
  backer: Address,
  token: Address,
  gauges: Address[],
  builderToGauge: Map<Address, Address>,
) => {
  const { data: isStateSyncHealthy, isLoading: healthCheckIsLoading } = useStateSyncHealthCheck({
    initialData: true,
  })

  // --- Source 1: DB (StateSync healthy) ---
  const {
    data: dbData,
    isLoading: dbLoading,
    error: dbError,
  } = useQuery({
    queryKey: ['backerRewardsClaimed', 'db', backer, token],
    queryFn: async (): Promise<DbBackerRewardsClaimed[]> => {
      const res = await fetch(`/api/backers/${backer}/rewards-claimed?token=${token}&pageSize=1000`)
      if (!res.ok) throw new Error(`DB fetch failed: ${res.status}`)
      const json = await res.json()
      return json.data ?? []
    },
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !healthCheckIsLoading && isStateSyncHealthy,
  })

  // --- Source 2: The Graph (placeholder) ---
  // Add when the subgraph query is ready. Wire up its own enabled condition,
  // e.g. enabled: !healthCheckIsLoading && !isStateSyncHealthy && !graphHealthy

  // --- Source 3: Blockscout event logs (StateSync unhealthy) ---
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useGetGaugesBackerRewardsClaimed(gauges, token, backer, !healthCheckIsLoading && !isStateSyncHealthy)

  if (healthCheckIsLoading || dbLoading) {
    return { data: {} as ClaimedRewards, isLoading: true, error: null }
  }

  if (isStateSyncHealthy) {
    return { data: normalizeDbData(dbData ?? [], builderToGauge), isLoading: false, error: dbError }
  }

  // Slot 2: The Graph would be returned here before Blockscout.

  return {
    data: normalizeEventData(eventData ?? {}),
    isLoading: eventLoading,
    error: eventError,
  }
}
