import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getBackerRewardPercentage,
  useGetPerTokenRewards,
} from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { RBTC, RIF, TokenSymbol } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { useMemo } from 'react'
import { Address } from 'viem'
import { FormattedTokenRewardData } from '../../backers/hooks/useBackerTotalEarned'

interface UseBuilderEstimatedRewardsProps {
  builder: Address
  gauge: Address
}

export const useGetBuilderEstimatedRewards = ({
  builder,
  gauge,
}: UseBuilderEstimatedRewardsProps): Partial<Record<TokenSymbol, FormattedTokenRewardData>> => {
  const { prices } = usePricesContext()
  const { getBuilderByAddress } = useBuilderContext()

  const { [RIF]: rifTokenRewardData, [RBTC]: rbtcTokenRewardData } = useGetPerTokenRewards()

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
  const rifFormatted = useMemo(() => {
    const rifRewardsAmountCalc =
      isRewarded && rewardShares && totalPotentialRewards
        ? (rifTokenRewardData?.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rifEstimatedRewards = (rifRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    const rifPrice = prices[RIF]?.price ?? 0
    return formatMetrics(rifEstimatedRewards, rifPrice, RIF)
  }, [
    rifTokenRewardData?.data,
    rewardShares,
    totalPotentialRewards,
    isRewarded,
    rewardPercentageToApply,
    prices,
    RIF,
  ])

  // Calculate estimated rewards for RBTC
  const rbtcFormatted = useMemo(() => {
    const rbtcRewardsAmountCalc =
      isRewarded && rewardShares && totalPotentialRewards
        ? (rbtcTokenRewardData?.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rbtcEstimatedRewards =
      (rbtcRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    const rbtcPrice = prices[RBTC]?.price ?? 0
    return formatMetrics(rbtcEstimatedRewards, rbtcPrice, RBTC)
  }, [
    rbtcTokenRewardData?.data,
    rewardShares,
    totalPotentialRewards,
    isRewarded,
    rewardPercentageToApply,
    prices,
    RBTC,
  ])

  return {
    [RIF]: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading:
        rifTokenRewardData?.isLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
      error:
        rifTokenRewardData?.error ??
        totalPotentialRewardsError ??
        rewardSharesError ??
        backerRewardsPctError ??
        cycleError,
    },
    [RBTC]: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading:
        rbtcTokenRewardData?.isLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
      error:
        rbtcTokenRewardData?.error ??
        totalPotentialRewardsError ??
        rewardSharesError ??
        backerRewardsPctError ??
        cycleError,
    },
  }
}
