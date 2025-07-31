import { useCycleContext } from '@/app/context/cycle/CycleContext'
import { getNotifyRewardAmount, useGetLastCycleDistribution } from '@/app/hooks'
import { useGetGaugesNotifyReward } from '@/app/hooks/useGetGaugesNotifyReward'
import { BuilderRewardsSummary } from '@/app/types'
import { useGetBuilderEstimatedRewards } from '@/app/hooks'
import { usePricesContext } from '@/shared/context'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { TOKENS } from '@/lib/tokens'
import { Address } from 'viem'

export const useGetBuilderRewardsSummary = (backer?: Address, currency = 'USD') => {
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

  const {
    data: allocationOf,
    isLoading: allocationOfLoading,
    error: allocationOfError,
  } = useReadGauges(
    {
      addresses: gauges,
      functionName: 'allocationOf',
      args: [backer as Address],
    },
    {
      enabled: !!backer,
    },
  )

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

      const backerAllocation = allocationOf[index] ?? 0n

      return {
        ...builder,
        backerAllocation,
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
  }, [
    estimatedRewards,
    totalAllocation,
    notifyRewardEventLastCycle,
    prices,
    rif,
    rbtc,
    currency,
    allocationOf,
  ])

  const isLoading =
    estimatedRewardsLoading ||
    allocationOfLoading ||
    totalAllocationLoading ||
    lastCycleRewardsLoading ||
    logsLoading ||
    cycleLoading
  const error =
    estimatedRewardsError ||
    allocationOfError ||
    totalAllocationError ||
    lastCycleRewardsError ||
    logsError ||
    cycleError

  return {
    data,
    isLoading,
    error,
  }
}
