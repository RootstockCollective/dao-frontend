import { useGetCycleRewards } from '@/app/collective-rewards/shared/hooks/useGetCycleRewards'
import { BuilderEstimatedRewards, CompleteBuilder } from '@/app/collective-rewards/types'
import { filterBuildersByState } from '@/app/collective-rewards/user'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { USD, WeiPerEther } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'

export const useGetBuilderEstimatedRewards = (currency = USD) => {
  const { rif, rbtc } = TOKENS
  const { builders } = useBuilderContext()
  const { activeBuilders, gauges } = useMemo(() => {
    const filteredBuilders = filterBuildersByState<CompleteBuilder>(builders)
    const builderGauges = filteredBuilders.map(({ gauge }) => gauge)
    return { activeBuilders: filteredBuilders, gauges: builderGauges }
  }, [builders])

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useReadBackersManager({
    functionName: 'totalPotentialReward',
  })

  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useReadGauges({ addresses: gauges, functionName: 'rewardShares' })

  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const { prices } = usePricesContext()
  const estimatedRewards: BuilderEstimatedRewards[] = useMemo(() => {
    const rifAmount = cycleRewards?.rif ?? 0n
    const rbtcAmount = cycleRewards?.rbtc ?? 0n
    const rifPrice = prices.RIF?.price ?? 0
    const rbtcPrice = prices.RBTC?.price ?? 0

    return activeBuilders.map((builder, index) => {
      const { backerRewardPct, stateFlags } = builder
      const rewardPercentageToApply = backerRewardPct?.current ?? 0n
      const builderRewardShares = rewardShares?.[index] ?? 0n
      const isRewarded = isBuilderRewardable(stateFlags)
      const builderEstimatedRewardsPct =
        totalPotentialRewards && isRewarded
          ? (builderRewardShares * rewardPercentageToApply) / totalPotentialRewards
          : 0n

      const backerEstimatedRewardsPct =
        totalPotentialRewards && isRewarded
          ? (builderRewardShares * (WeiPerEther - rewardPercentageToApply)) / totalPotentialRewards
          : 0n

      const builderRifEstimatedRewards = (builderEstimatedRewardsPct * rifAmount) / WeiPerEther
      const builderRbtcEstimatedRewards = (builderEstimatedRewardsPct * rbtcAmount) / WeiPerEther
      const backerRifEstimatedRewards = (backerEstimatedRewardsPct * rifAmount) / WeiPerEther
      const backerRbtcEstimatedRewards = (backerEstimatedRewardsPct * rbtcAmount) / WeiPerEther

      return {
        ...builder,
        builderEstimatedRewardsPct,
        backerEstimatedRewardsPct,
        backerEstimatedRewards: {
          rif: {
            amount: {
              value: backerRifEstimatedRewards,
              price: rifPrice,
              symbol: rif.symbol,
              currency,
            },
          },
          rbtc: {
            amount: {
              value: backerRbtcEstimatedRewards,
              price: rbtcPrice,
              symbol: rbtc.symbol,
              currency,
            },
          },
        },
        builderEstimatedRewards: {
          rif: {
            amount: {
              value: builderRifEstimatedRewards,
              price: rifPrice,
              symbol: rif.symbol,
              currency,
            },
          },
          rbtc: {
            amount: {
              value: builderRbtcEstimatedRewards,
              price: rbtcPrice,
              symbol: rbtc.symbol,
              currency,
            },
          },
        },
      }
    })
  }, [activeBuilders, rewardShares, totalPotentialRewards, cycleRewards, prices, currency, rif, rbtc])

  const isLoading = totalPotentialRewardsLoading || rewardSharesLoading || cycleRewardsLoading
  const error = totalPotentialRewardsError || rewardSharesError || cycleRewardsError

  return {
    data: estimatedRewards,
    isLoading,
    error,
  }
}
