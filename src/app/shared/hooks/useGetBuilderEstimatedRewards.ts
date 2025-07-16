import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { useBuilderContext } from '../../collective-rewards/user/context/BuilderContext'
import { useGetCycleRewards } from '../../collective-rewards/shared/hooks/useGetCycleRewards'
import { filterBuildersByState } from '../../collective-rewards/user'
import { BuilderEstimatedRewards, CompleteBuilder } from '../../collective-rewards/types'
import { useMemo } from 'react'
import { isBuilderRewardable } from '../../collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Token } from '@/app/collective-rewards/rewards'

export const useGetBuilderEstimatedRewards = (
  { rif, rbtc }: { [token: string]: Token },
  currency = 'USD',
) => {
  const { builders } = useBuilderContext()
  const activeBuilders = filterBuildersByState<CompleteBuilder>(builders)
  const gauges = activeBuilders.map(({ gauge }) => gauge)

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
