import { useCycleContext } from '@/app/collective-rewards/metrics'
import { getNotifyRewardAmount, Token, useGetLastCycleDistribution } from '@/app/collective-rewards/rewards'
import { useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards/hooks/useGetGaugesNotifyReward'
import { BuilderRewardsSummary } from '@/app/collective-rewards/types'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { usePricesContext } from '@/shared/context'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { TOKENS } from '@/lib/tokens'

export const useGetBuilderRewardsSummary = (currency = 'USD') => {
  const { rif, rbtc } = TOKENS
  const {
    data: estimatedRewards,
    isLoading: estimatedRewardsLoading,
    error: estimatedRewardsError,
  } = useGetBuilderEstimatedRewards()
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()

  const gauges = useMemo(() => {
    return estimatedRewards.map(({ gauge }) => gauge)
  }, [estimatedRewards])

  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })

  const {
    data: { fromTimestamp, toTimestamp },
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const {
    data: notifyRewardEventLastCycle,
    isLoading: logsLoading,
    error: logsError,
  } = useGetGaugesNotifyReward(gauges, undefined, fromTimestamp, toTimestamp)

  const { prices } = usePricesContext()

  const data: BuilderRewardsSummary[] = useMemo(() => {
    const rifPrice = prices[rif.symbol]?.price ?? 0
    const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
    const sumTotalAllocation = Object.values(totalAllocation).reduce<bigint>(
      (acc, value) => acc + (value ?? 0n),
      0n,
    )
    const rifBuildersRewardsAmount = getNotifyRewardAmount(
      notifyRewardEventLastCycle,
      rif.address,
      'backersAmount_',
    )
    const rbtcBuildersRewardsAmount = getNotifyRewardAmount(
      notifyRewardEventLastCycle,
      rbtc.address,
      'backersAmount_',
    )

    return estimatedRewards.map((builder, index) => {
      const { gauge } = builder

      const builderTotalAllocation = totalAllocation[index] ?? 0n
      const totalAllocationPercentage = sumTotalAllocation
        ? (builderTotalAllocation * 100n) / sumTotalAllocation
        : 0n

      const rifLastCycleRewardsAmount = rifBuildersRewardsAmount[gauge] ?? 0n
      const rbtcLastCycleRewardsAmount = rbtcBuildersRewardsAmount[gauge] ?? 0n

      return {
        ...builder,
        totalAllocationPercentage,
        lastCycleRewards: {
          rif: {
            amount: {
              value: rifLastCycleRewardsAmount,
              price: rifPrice,
              symbol: rif.symbol,
              currency,
            },
          },
          rbtc: {
            amount: {
              value: rbtcLastCycleRewardsAmount,
              price: rbtcPrice,
              symbol: rbtc.symbol,
              currency,
            },
          },
        },
      }
    })
  }, [estimatedRewards, totalAllocation, notifyRewardEventLastCycle, prices, rif, rbtc, currency])

  const isLoading =
    estimatedRewardsLoading ||
    totalAllocationLoading ||
    lastCycleRewardsLoading ||
    logsLoading ||
    cycleLoading
  const error =
    estimatedRewardsError || totalAllocationError || lastCycleRewardsError || logsError || cycleError

  return {
    data,
    isLoading,
    error,
  }
}
