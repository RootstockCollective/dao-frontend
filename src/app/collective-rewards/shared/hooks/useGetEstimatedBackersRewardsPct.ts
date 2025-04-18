import { BackerRewardPercentage, useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'

export type EstimatedBackerRewards = RequiredBuilder & {
  estimatedBackerRewardsPct: bigint
  rewardPercentage: BackerRewardPercentage
}

export const useGetEstimatedBackersRewardsPct = () => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>()
  const gauges = builders.map(({ gauge }) => gauge)
  const buildersAddress = builders.map(({ address }) => address)

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
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress)

  const data = useMemo(() => {
    return builders.reduce<EstimatedBackerRewards[]>((acc, builder, i) => {
      const { address, gauge, stateFlags } = builder
      const builderRewardShares = rewardShares[i] ?? 0n
      const rewardPercentage = backersRewardsPct[address] ?? null
      const rewardPercentageToApply = rewardPercentage?.current ?? 0n

      const isRewarded = isBuilderRewardable(stateFlags)

      const estimatedBackerRewardsPct =
        totalPotentialRewards && isRewarded
          ? (builderRewardShares * rewardPercentageToApply) / totalPotentialRewards
          : 0n

      return [
        ...acc,
        {
          ...builder,
          estimatedBackerRewardsPct,
          rewardPercentage,
        },
      ]
    }, [])
  }, [backersRewardsPct, builders, rewardShares, totalPotentialRewards])

  const isLoading =
    buildersLoading || totalPotentialRewardsLoading || rewardSharesLoading || backersRewardsPctLoading
  const error = buildersError ?? totalPotentialRewardsError ?? rewardSharesError ?? backersRewardsPctError

  return {
    data,
    isLoading,
    error,
  }
}
