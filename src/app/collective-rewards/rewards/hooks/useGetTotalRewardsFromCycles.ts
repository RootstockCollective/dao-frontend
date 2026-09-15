import { useQuery } from '@tanstack/react-query'
import Big from 'big.js'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { CycleRewardsItem } from '@/app/collective-rewards/types'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

import { fetchAllPages } from '../utils/fetchAllPages'

export const fetchAllCycles = (): Promise<CycleRewardsItem[]> =>
  fetchAllPages<CycleRewardsItem>(
    (page, pageSize) =>
      `/api/cycles?${new URLSearchParams({
        pageSize: String(pageSize),
        page: String(page),
        sortBy: 'currentCycleStart',
        sortDirection: 'desc',
      })}`,
    'Failed to fetch cycles',
  )

/**
 * Sums a single token's `rewardPerToken` amount across every cycle.
 * The cycles API serialises token keys as lowercase hex, so the direct lookup
 * almost always hits; the `isAddressEqual` scan only guards a non-normalised key.
 */
export const sumCycleRewardForToken = (cycles: CycleRewardsItem[], tokenAddress: Address): bigint => {
  const lowerAddr = tokenAddress.toLowerCase()
  return cycles.reduce((total, cycle) => {
    const direct = cycle.rewardPerToken[lowerAddr] ?? cycle.rewardPerToken[tokenAddress]
    if (direct !== undefined) return total + BigInt(direct)
    const entry = Object.entries(cycle.rewardPerToken).find(([addr]) =>
      isAddressEqual(addr as `0x${string}`, tokenAddress),
    )
    return entry ? total + BigInt(entry[1]) : total
  }, 0n)
}

export const useGetTotalRewardsFromCycles = () => {
  const { prices } = usePricesContext()

  const {
    data: isStateSyncHealthy,
    isLoading: healthCheckIsLoading,
    error: healthCheckError,
  } = useStateSyncHealthCheck({ initialData: true })

  const {
    data: cycles,
    isLoading: cyclesIsLoading,
    error: cyclesError,
  } = useQuery<CycleRewardsItem[], Error>({
    queryFn: fetchAllCycles,
    queryKey: ['totalRewardsDistributedCycles'],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: !healthCheckIsLoading && !!isStateSyncHealthy,
  })

  const unhealthyError =
    (!healthCheckIsLoading && !isStateSyncHealthy && new Error('Unhealthy state sync')) || null

  const error = healthCheckError ?? unhealthyError ?? cyclesError ?? null

  const isLoading = healthCheckIsLoading || cyclesIsLoading

  const data = useMemo(() => {
    return REWARD_TOKEN_KEYS.reduce<{ rewardPerToken: MetricToken[]; combinedRewardsFiat: Big }>(
      (acc, tokenKey) => {
        const { address: tokenAddress, symbol } = TOKENS[tokenKey]
        const price = prices[symbol]?.price ?? 0

        const value = sumCycleRewardForToken(cycles ?? [], tokenAddress)

        const metricToken = createMetricToken({ symbol, value, price })
        acc.rewardPerToken.push(metricToken)
        acc.combinedRewardsFiat = acc.combinedRewardsFiat.add(Big(metricToken.fiatValue))
        return acc
      },
      { rewardPerToken: [], combinedRewardsFiat: Big(0) },
    )
  }, [cycles, prices])

  return { data, isLoading, error }
}
