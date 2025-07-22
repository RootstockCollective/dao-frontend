import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import { getBackerRewardPercentage, useGetPerTokenRewards } from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { formatRewards } from '@/app/my-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { useMemo } from 'react'
import { Address } from 'viem'

interface UseBuilderEstimatedRewardsProps {
  builder: Address
  gauge: Address
}

interface TokenRewardData {
  amount: string
  fiatAmount: string
  isLoading: boolean
  error: Error | null
}

interface EstimatedRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
}

export const useGetBuilderEstimatedRewards = ({
  builder,
  gauge,
}: UseBuilderEstimatedRewardsProps): EstimatedRewardsData => {
  const { prices } = usePricesContext()
  const { getBuilderByAddress } = useBuilderContext()
  const { rif, rbtc } = TOKENS

  const { rif: rifTokenReward, rbtc: rbtcTokenReward } = useGetPerTokenRewards()

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
        ? (rifTokenReward.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rifEstimatedRewards = (rifRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    const rifPrice = prices[rif.symbol]?.price ?? 0
    return formatRewards(rifEstimatedRewards, rifPrice, rif.symbol)
  }, [
    rifTokenReward.data,
    rewardShares,
    totalPotentialRewards,
    isRewarded,
    rewardPercentageToApply,
    prices,
    rif.symbol,
  ])

  // Calculate estimated rewards for rBTC
  const rbtcFormatted = useMemo(() => {
    const rbtcRewardsAmountCalc =
      isRewarded && rewardShares && totalPotentialRewards
        ? (rbtcTokenReward.data ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rbtcEstimatedRewards =
      (rbtcRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
    return formatRewards(rbtcEstimatedRewards, rbtcPrice, rbtc.symbol)
  }, [
    rbtcTokenReward.data,
    rewardShares,
    totalPotentialRewards,
    isRewarded,
    rewardPercentageToApply,
    prices,
    rbtc.symbol,
  ])

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading:
        rifTokenReward.isLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
      error:
        rifTokenReward.error ??
        totalPotentialRewardsError ??
        rewardSharesError ??
        backerRewardsPctError ??
        cycleError,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading:
        rbtcTokenReward.isLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
      error:
        rbtcTokenReward.error ??
        totalPotentialRewardsError ??
        rewardSharesError ??
        backerRewardsPctError ??
        cycleError,
    },
  }
}
