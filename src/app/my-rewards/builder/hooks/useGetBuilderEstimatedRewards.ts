import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import { getBackerRewardPercentage, useGetPerTokenRewards } from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { useReadBackersManager, useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { useMemo } from 'react'
import { Address } from 'viem'

interface UseBuilderEstimatedRewardsProps {
  builder: Address
  gauge: Address
}

interface EstimatedRewardsData {
  rif: bigint
  rbtc: bigint
  usdrif: bigint
  isLoading: boolean
  error: Error | null
}

export const useGetBuilderEstimatedRewards = ({
  builder,
  gauge,
}: UseBuilderEstimatedRewardsProps): EstimatedRewardsData => {
  const { getBuilderByAddress } = useBuilderContext()
  const { rif, rbtc, usdrif } = TOKENS

  const { rif: rifTokenReward, rbtc: rbtcTokenReward, usdrif: usdrifTokenReward } = useGetPerTokenRewards()

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
  } = useReadGauge({ address: gauge, functionName: 'rewardShares' })

  const {
    data: { cycleNext },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()

  const {
    data: rawBackerRewardsPct,
    isLoading: backerRewardsPctLoading,
    error: backerRewardsPctError,
  } = useReadBuilderRegistry({
    functionName: 'backerRewardPercentage',
    args: [builder],
  })

  const backerRewardsPct = useMemo(() => {
    // FIXME: to be reviewed
    if (!cycleNext) {
      return { current: 0n, next: 0n, cooldownEndTime: 0n }
    }
    const [previous, next, cooldownEndTime] = rawBackerRewardsPct ?? [0n, 0n, 0n]
    return getBackerRewardPercentage(previous, next, cooldownEndTime, cycleNext.toSeconds())
  }, [rawBackerRewardsPct, cycleNext])

  const rewardPercentageToApply = backerRewardsPct.current

  // Check if builder is rewardable
  const isRewarded = useMemo(() => {
    const claimingBuilder = getBuilderByAddress(builder)
    return isBuilderRewardable(claimingBuilder?.stateFlags)
  }, [builder, getBuilderByAddress])

  // Calculate estimated rewards for RIF
  const rifAmount = useMemo(() => {
    const rifRewardsAmountCalc =
      isRewarded && rewardShares && totalPotentialRewards
        ? (rifTokenReward.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rifEstimatedRewards = (rifRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    return rifEstimatedRewards
  }, [rifTokenReward.data, rewardShares, totalPotentialRewards, isRewarded, rewardPercentageToApply])

  // Calculate estimated rewards for rBTC
  const rbtcAmount = useMemo(() => {
    const rbtcRewardsAmountCalc =
      isRewarded && rewardShares && totalPotentialRewards
        ? (rbtcTokenReward.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rbtcEstimatedRewards =
      (rbtcRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    return rbtcEstimatedRewards
  }, [rbtcTokenReward.data, rewardShares, totalPotentialRewards, isRewarded, rewardPercentageToApply])

  // Calculate estimated rewards for USDRIF
  const usdrifAmount = useMemo(() => {
    const usdrifRewardsAmountCalc =
      isRewarded && rewardShares && totalPotentialRewards
        ? (usdrifTokenReward.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const usdrifEstimatedRewards =
      (usdrifRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    return usdrifEstimatedRewards
  }, [usdrifTokenReward.data, rewardShares, totalPotentialRewards, isRewarded, rewardPercentageToApply])

  return {
    rif: rifAmount,
    rbtc: rbtcAmount,
    usdrif: usdrifAmount,
    isLoading:
      rifTokenReward.isLoading ||
      rbtcTokenReward.isLoading ||
      usdrifTokenReward.isLoading ||
      totalPotentialRewardsLoading ||
      rewardSharesLoading ||
      backerRewardsPctLoading ||
      cycleLoading,
    error:
      rifTokenReward.error ??
      rbtcTokenReward.error ??
      usdrifTokenReward.error ??
      totalPotentialRewardsError ??
      rewardSharesError ??
      backerRewardsPctError ??
      cycleError,
  }
}
