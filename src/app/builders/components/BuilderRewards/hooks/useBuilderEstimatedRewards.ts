import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getBackerRewardPercentage,
  useGetPerTokenRewards,
} from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable, useHandleErrors } from '@/app/collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager, useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { Token } from '@/app/collective-rewards/rewards'
import { useEffect, useMemo, useState } from 'react'

interface UseBuilderEstimatedRewardsProps {
  builder: Address
  gauge: Address
  tokens: {
    rif: Token
    rbtc: Token
  }
  currency?: string
}

interface TokenRewardData {
  amount: string
  fiatAmount: string
  isLoading: boolean
}

interface EstimatedRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
}

export const useBuilderEstimatedRewards = ({
  builder,
  gauge,
  tokens: { rif, rbtc },
  currency = 'USD',
}: UseBuilderEstimatedRewardsProps): EstimatedRewardsData => {
  const { prices } = usePricesContext()
  const { getBuilderByAddress } = useBuilderContext()

  // Get per-token rewards
  const { rif: rifRewards, rbtc: rbtcRewards } = useGetPerTokenRewards()

  // State for RIF rewards
  const [rifRewardsAmount, setRifRewardsAmount] = useState<bigint>(0n)
  const [rifRewardsError, setRifRewardsError] = useState<Error | null>(null)
  const [isRifRewardsLoading, setIsRifRewardsLoading] = useState(true)

  // State for rBTC rewards
  const [rbtcRewardsAmount, setRbtcRewardsAmount] = useState<bigint>(0n)
  const [rbtcRewardsError, setRbtcRewardsError] = useState<Error | null>(null)
  const [isRbtcRewardsLoading, setIsRbtcRewardsLoading] = useState(true)

  // Update RIF rewards state
  useEffect(() => {
    if (rifRewards && rifRewards.data) {
      setRifRewardsAmount(rifRewards.data ?? 0n)
    }
    if (rifRewards && rifRewards.error) {
      setRifRewardsError(rifRewards.error)
    }
    if (rifRewards) {
      setIsRifRewardsLoading(rifRewards.isLoading)
    }
  }, [rifRewards])

  // Update rBTC rewards state
  useEffect(() => {
    if (rbtcRewards && rbtcRewards.data) {
      setRbtcRewardsAmount(rbtcRewards.data ?? 0n)
    }
    if (rbtcRewards && rbtcRewards.error) {
      setRbtcRewardsError(rbtcRewards.error)
    }
    if (rbtcRewards) {
      setIsRbtcRewardsLoading(rbtcRewards.isLoading)
    }
  }, [rbtcRewards])

  // Get total potential rewards
  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useReadBackersManager({
    functionName: 'totalPotentialReward',
  })

  // Get reward shares
  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useReadGauge({ address: gauge, functionName: 'rewardShares' })

  // Get cycle context
  const {
    data: { cycleNext },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()

  // Get backer reward percentage
  const {
    data: rawBackerRewardsPct,
    isLoading: backerRewardsPctLoading,
    error: backerRewardsPctError,
  } = useReadBuilderRegistry({
    functionName: 'backerRewardPercentage',
    args: [builder],
  })

  // Calculate backer reward percentage
  const backerRewardsPct = useMemo(() => {
    const [previous, next, cooldownEndTime] = rawBackerRewardsPct ?? [0n, 0n, 0n]
    return getBackerRewardPercentage(previous, next, cooldownEndTime, cycleNext.toSeconds())
  }, [rawBackerRewardsPct, cycleNext])

  const rewardPercentageToApply = backerRewardsPct.current

  // Check if builder is rewardable
  const claimingBuilder = getBuilderByAddress(builder)
  const isRewarded = isBuilderRewardable(claimingBuilder?.stateFlags)

  // Handle errors
  useHandleErrors({
    error:
      rifRewardsError ||
      rbtcRewardsError ||
      totalPotentialRewardsError ||
      rewardSharesError ||
      backerRewardsPctError ||
      cycleError,
    title: 'Error loading estimated rewards',
  })

  // Calculate estimated rewards for RIF
  const rifRewardsAmountCalc =
    isRewarded && rewardShares && totalPotentialRewards
      ? (rifRewardsAmount * rewardShares) / totalPotentialRewards
      : 0n
  const rifEstimatedRewards = (rifRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rifFormatted = formatMetrics(rifEstimatedRewards, rifPrice, rif.symbol, currency)

  // Calculate estimated rewards for rBTC
  const rbtcRewardsAmountCalc =
    isRewarded && rewardShares && totalPotentialRewards
      ? (rbtcRewardsAmount * rewardShares) / totalPotentialRewards
      : 0n
  const rbtcEstimatedRewards = (rbtcRewardsAmountCalc * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
  const rbtcFormatted = formatMetrics(rbtcEstimatedRewards, rbtcPrice, rbtc.symbol, currency)

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading:
        isRifRewardsLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading:
        isRbtcRewardsLoading ||
        totalPotentialRewardsLoading ||
        rewardSharesLoading ||
        backerRewardsPctLoading ||
        cycleLoading,
    },
  }
}
