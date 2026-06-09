import { useQuery } from '@tanstack/react-query'
import Big from 'big.js'
import { useMemo } from 'react'
import { isAddressEqual } from 'viem'

import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { CycleRewardsItem } from '@/app/collective-rewards/types'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { AVERAGE_BLOCKTIME, MAX_PAGE_SIZE } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

export const fetchAllCycles = async (): Promise<CycleRewardsItem[]> => {
  const firstParams = new URLSearchParams({
    pageSize: String(MAX_PAGE_SIZE),
    page: '1',
    sortBy: 'currentCycleStart',
    sortDirection: 'desc',
  })
  const firstResponse = await fetch(`/api/cycles?${firstParams}`)
  if (!firstResponse.ok) throw new Error('Failed to fetch cycles')

  const { data, count }: { data: CycleRewardsItem[]; count: number } = await firstResponse.json()

  const totalPages = Math.ceil(count / MAX_PAGE_SIZE)
  if (totalPages <= 1) return data

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => {
      const params = new URLSearchParams({
        pageSize: String(MAX_PAGE_SIZE),
        page: String(i + 2),
        sortBy: 'currentCycleStart',
        sortDirection: 'desc',
      })
      return fetch(`/api/cycles?${params}`)
        .then(r => {
          if (!r.ok) throw new Error('Failed to fetch cycles page')
          return r.json() as Promise<{ data: CycleRewardsItem[] }>
        })
        .then(r => r.data)
    }),
  )

  return [...data, ...remainingPages.flat()]
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

        const lowerAddr = tokenAddress.toLowerCase()
        const value = (cycles ?? []).reduce((total, cycle) => {
          const direct = cycle.rewardPerToken[lowerAddr] ?? cycle.rewardPerToken[tokenAddress]
          if (direct !== undefined) return total + BigInt(direct)
          const entry = Object.entries(cycle.rewardPerToken).find(([addr]) =>
            isAddressEqual(addr as `0x${string}`, tokenAddress),
          )
          return entry ? total + BigInt(entry[1]) : total
        }, 0n)

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
