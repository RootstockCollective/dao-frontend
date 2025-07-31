import { useCycleContext } from '@/app/context'
import { useBuilderContext } from '@/app/context'
import { isBuilderRewardable, getBackerRewardPercentage } from '@/app/utils'
import { formatRewards } from '@/app/my-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useGetCycleRewards } from '@/app/hooks'

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

  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

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
        ? (cycleRewards.rif ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rifEstimatedRewards = (rifRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    const rifPrice = prices[rif.symbol]?.price ?? 0
    return formatRewards(rifEstimatedRewards, rifPrice, rif.symbol)
  }, [
    cycleRewards.rif,
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
        ? (cycleRewards.rbtc ?? 0n * rewardShares) / totalPotentialRewards
        : 0n
    const rbtcEstimatedRewards =
      (rbtcRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
    const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
    return formatRewards(rbtcEstimatedRewards, rbtcPrice, rbtc.symbol)
  }, [
    cycleRewards.rbtc,
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
        cycleRewardsLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
      error:
        cycleRewardsError ??
        totalPotentialRewardsError ??
        rewardSharesError ??
        backerRewardsPctError ??
        cycleError,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading:
        cycleRewardsLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
      error:
        cycleRewardsError ??
        totalPotentialRewardsError ??
        rewardSharesError ??
        backerRewardsPctError ??
        cycleError,
    },
  }
}
