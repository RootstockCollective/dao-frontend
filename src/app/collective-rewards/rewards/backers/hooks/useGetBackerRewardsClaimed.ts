'use client'

import { useQuery } from '@tanstack/react-query'
import { Address, getAddress } from 'viem'

import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

import { fetchAllPages } from '../../utils/fetchAllPages'
import {
  BackerRewardsClaimedEventLog,
  useGetGaugesBackerRewardsClaimed,
} from './useGetGaugesBackerRewardsClaimed'

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

function normalizeEventData(eventData: Record<Address, BackerRewardsClaimedEventLog>): ClaimedRewards {
  return Object.entries(eventData).reduce<ClaimedRewards>((acc, [gauge, events]) => {
    acc[gauge as Address] = events.reduce((sum, event) => sum + event.args.amount_, 0n)
    return acc
  }, {})
}

const fetchAllBackerRewardsClaimed = (backer: Address, token: Address): Promise<DbBackerRewardsClaimed[]> =>
  fetchAllPages<DbBackerRewardsClaimed>(
    (page, pageSize) =>
      `/api/backers/${backer}/rewards-claimed?${new URLSearchParams({
        token,
        pageSize: String(pageSize),
        page: String(page),
        sortBy: 'id',
        sortDirection: 'asc',
      })}`,
    'DB fetch failed',
  )

/**
 * Fetches backer rewards claimed with a health-check-gated fallback chain:
 *   1. DB  (StateSync healthy)  → /api/backers/[backer]/rewards-claimed
 *   2. The Graph  (slot reserved — add its own enabled condition when ready)
 *   3. Blockscout event logs  (StateSync unhealthy, or the DB query failed)
 *
 * Output is always Record<gaugeAddress, totalClaimedAmount> for the given token.
 */
export const useGetBackerRewardsClaimed = (
  backer: Address,
  token: Address,
  gauges: Address[],
  builderToGauge: Map<Address, Address>,
) => {
  const {
    data: isStateSyncHealthy,
    isLoading: healthCheckIsLoading,
    error: healthCheckError,
  } = useStateSyncHealthCheck({
    initialData: true,
  })

  const useDb = !healthCheckIsLoading && !healthCheckError && !!isStateSyncHealthy

  // --- Source 1: DB (StateSync healthy) ---
  const {
    data: dbData,
    isLoading: dbLoading,
    error: dbError,
  } = useQuery({
    queryKey: ['backerRewardsClaimed', 'db', backer, token],
    queryFn: () => fetchAllBackerRewardsClaimed(backer, token),
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: useDb,
  })

  // A failed DB fetch (StateSync reported healthy but the query errored) falls back
  // to events, mirroring the unhealthy path — otherwise the metric would surface a
  // hard error with no recovery.
  const dbFailed = useDb && !!dbError

  // --- Source 2: The Graph (placeholder) ---
  // Add when the subgraph query is ready. Wire up its own enabled condition,
  // e.g. enabled: !healthCheckIsLoading && !isStateSyncHealthy && !graphHealthy

  // --- Source 3: Blockscout event logs (StateSync unhealthy, health check error, or DB error) ---
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useGetGaugesBackerRewardsClaimed(gauges, token, backer, !healthCheckIsLoading && (!useDb || dbFailed))

  if (healthCheckIsLoading || (useDb && dbLoading)) {
    return { data: {} as ClaimedRewards, isLoading: true, error: null }
  }

  if (useDb && !dbFailed) {
    return { data: normalizeDbData(dbData ?? [], builderToGauge), isLoading: false, error: null }
  }

  // Slot 2: The Graph would be returned here before Blockscout.

  return {
    data: normalizeEventData(eventData ?? {}),
    isLoading: eventLoading,
    error: eventError ?? healthCheckError,
  }
}
