import { useGetCycleRewards } from '@/app/collective-rewards/shared/hooks/useGetCycleRewards'
import { BuilderEstimatedRewards, CompleteBuilder } from '@/app/collective-rewards/types'
import { filterBuildersByState } from '@/app/collective-rewards/user'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { RBTC, RIF, USD, USDRIF, WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'

export const useGetBuilderEstimatedRewards = (currency = USD) => {
  const { builders } = useBuilderContext()

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useReadBackersManager({
    functionName: 'totalPotentialReward',
  })

  const { activeBuilders, gauges } = useMemo(() => {
    const filteredBuilders = filterBuildersByState<CompleteBuilder>(builders)
    const builderGauges = filteredBuilders.map(({ gauge }) => gauge)

    return { activeBuilders: filteredBuilders, gauges: builderGauges }
  }, [builders])

  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useReadGauges({ addresses: gauges, functionName: 'rewardShares' }, {
    enabled: !!gauges.length,
  })

  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const { prices } = usePricesContext()

  const estimatedRewards: BuilderEstimatedRewards[] = useMemo(() => {
    // TODO: this is so unreadable, refactor using REWARDA_TOKEN_KEYS
    const rifAmount = cycleRewards?.rif ?? 0n
    const usdrifAmount = cycleRewards?.usdrif ?? 0n
    const rbtcAmount = cycleRewards?.rbtc ?? 0n
    const rifPrice = prices[RIF]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0

    return activeBuilders.map((builder, index) => {
      const { backerRewardPct, stateFlags } = builder
      const rewardPercentageToApply = backerRewardPct?.current ?? 0n
      const builderRewardShares = rewardShares?.[index] ?? 0n
      const isRewarded = isBuilderRewardable(stateFlags)
      const builderEstimatedRewardsPct =
        totalPotentialRewards && isRewarded
          ? (builderRewardShares * (WeiPerEther - rewardPercentageToApply)) / totalPotentialRewards
          : 0n

      const backerEstimatedRewardsPct =
        totalPotentialRewards && isRewarded
          ? (builderRewardShares * rewardPercentageToApply) / totalPotentialRewards
          : 0n

      const builderRifEstimatedRewards = (builderEstimatedRewardsPct * rifAmount) / WeiPerEther
      const builderUsdrifEstimatedRewards = (builderEstimatedRewardsPct * usdrifAmount) / WeiPerEther
      const builderRbtcEstimatedRewards = (builderEstimatedRewardsPct * rbtcAmount) / WeiPerEther
      const backerRifEstimatedRewards = (backerEstimatedRewardsPct * rifAmount) / WeiPerEther
      const backerUsdrifEstimatedRewards = (backerEstimatedRewardsPct * usdrifAmount) / WeiPerEther
      const backerRbtcEstimatedRewards = (backerEstimatedRewardsPct * rbtcAmount) / WeiPerEther

      return {
        ...builder,
        rewardShares: builderRewardShares,
        builderEstimatedRewardsPct,
        backerEstimatedRewardsPct,
        backerEstimatedRewards: {
          rif: {
            amount: {
              value: backerRifEstimatedRewards,
              price: rifPrice,
              symbol: RIF,
              currency,
            },
          },
          usdrif: {
            amount: {
              value: backerUsdrifEstimatedRewards,
              price: usdrifPrice,
              symbol: USDRIF,
              currency,
            },
          },
          rbtc: {
            amount: {
              value: backerRbtcEstimatedRewards,
              price: rbtcPrice,
              symbol: RBTC,
              currency,
            },
          },
        },
        builderEstimatedRewards: {
          rif: {
            amount: {
              value: builderRifEstimatedRewards,
              price: rifPrice,
              symbol: RIF,
              currency,
            },
          },
          usdrif: {
            amount: {
              value: builderUsdrifEstimatedRewards,
              price: usdrifPrice,
              symbol: USDRIF,
              currency,
            },
          },
          rbtc: {
            amount: {
              value: builderRbtcEstimatedRewards,
              price: rbtcPrice,
              symbol: RBTC,
              currency,
            },
          },
        },
      }
    })
  }, [activeBuilders, rewardShares, totalPotentialRewards, cycleRewards, prices, currency])

  const isLoading = totalPotentialRewardsLoading || rewardSharesLoading || cycleRewardsLoading
  const error = totalPotentialRewardsError || rewardSharesError || cycleRewardsError

  return {
    data: estimatedRewards,
    isLoading,
    error,
  }
}
