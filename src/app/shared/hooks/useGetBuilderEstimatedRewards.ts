import { useGetCycleRewards } from '@/app/collective-rewards/shared/hooks/useGetCycleRewards'
import { BuilderEstimatedRewards, CompleteBuilder } from '@/app/collective-rewards/types'
import { filterBuildersByState } from '@/app/collective-rewards/user'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'

import { REWARD_TOKEN_KEYS, TOKENS, type RewardTokenKey } from '@/lib/tokens' // adjust import path

interface TokenAmount {
  amount: {
    value: bigint
    price: number
    symbol: string
    currency: string
  }
}

type RewardsByToken = Record<RewardTokenKey, TokenAmount>

export const useGetBuilderEstimatedRewards = (currency = 'USD') => {
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
  } = useReadGauges(
    { addresses: gauges, functionName: 'rewardShares' },
    {
      enabled: !!gauges.length,
    },
  )

  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const { prices } = usePricesContext()

  const estimatedRewards: BuilderEstimatedRewards[] = useMemo(() => {
    if (!cycleRewards) return []

    const buildRewardsForPct = (pct: bigint): RewardsByToken =>
      REWARD_TOKEN_KEYS.reduce((acc, key) => {
        const token = TOKENS[key]
        const totalTokenAmount = cycleRewards[key] ?? 0n
        const tokenPrice = prices[token.symbol]?.price ?? 0

        acc[key] = {
          amount: {
            value: (pct * totalTokenAmount) / WeiPerEther,
            price: tokenPrice,
            symbol: token.symbol,
            currency,
          },
        }

        return acc
      }, {} as RewardsByToken)

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

      const builderEstimatedRewards = buildRewardsForPct(builderEstimatedRewardsPct)
      const backerEstimatedRewards = buildRewardsForPct(backerEstimatedRewardsPct)

      return {
        ...builder,
        rewardShares: builderRewardShares,
        builderEstimatedRewardsPct,
        backerEstimatedRewardsPct,
        builderEstimatedRewards,
        backerEstimatedRewards,
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
