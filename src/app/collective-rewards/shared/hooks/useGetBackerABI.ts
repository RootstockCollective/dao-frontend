import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauges, useReadBackersManager } from '@/shared/hooks/contracts'
import Big from 'big.js'
import { Address } from 'viem'
import { useMemo } from 'react'
import { calculateAbi } from './useGetABI'
import { useGetCycleRewards } from './useGetCycleRewards'
import { getCyclePayout } from './getCyclePayout'
import { useGetBuilderEstimatedRewards } from '../../../shared/hooks/useGetBuilderEstimatedRewards'
import { getTokens } from '@/lib/tokens'

export const useGetBackerABI = (backer: Address) => {
  const {
    data: estimatedRewards,
    isLoading: estimatedRewardsLoading,
    error: estimatedRewardsError,
  } = useGetBuilderEstimatedRewards(getTokens())
  const gauges = estimatedRewards.map(({ gauge }) => gauge)
  const {
    data: allocationOf,
    isLoading: allocationOfLoading,
    error: allocationOfError,
  } = useReadGauges({ addresses: gauges, functionName: 'allocationOf', args: [backer] })
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })
  const {
    data: backerTotalAllocation,
    isLoading: backerTotalAllocationLoading,
    error: backerTotalAllocationError,
  } = useReadBackersManager({
    functionName: 'backerTotalAllocation',
    args: [backer],
  })
  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()
  const { prices } = usePricesContext()

  const abi = useMemo(() => {
    const rifPrice = prices.RIF?.price ?? 0

    const backerRewards = estimatedRewards.reduce((acc, { backerEstimatedRewardsPct }, i) => {
      const builderTotalAllocation = totalAllocation[i] ?? 0n
      const backerAllocationOf = allocationOf[i] ?? 0n

      const rbtcPrice = prices.RBTC?.price ?? 0

      const cyclePayout = getCyclePayout(rifPrice, rbtcPrice, cycleRewards?.rif, cycleRewards?.rbtc)

      const backersRewardsAmount = (backerEstimatedRewardsPct * cyclePayout) / WeiPerEther
      const backerReward = builderTotalAllocation
        ? (backersRewardsAmount * backerAllocationOf) / builderTotalAllocation
        : 0n

      return acc + backerReward
    }, 0n)

    if (!backerTotalAllocation) {
      return Big(0)
    }

    const rewardsPerStRif = (backerRewards * WeiPerEther) / backerTotalAllocation

    return calculateAbi(Big(rewardsPerStRif.toString()), rifPrice)
  }, [allocationOf, backerTotalAllocation, estimatedRewards, cycleRewards, prices, totalAllocation])

  const isLoading =
    estimatedRewardsLoading ||
    allocationOfLoading ||
    totalAllocationLoading ||
    backerTotalAllocationLoading ||
    cycleRewardsLoading

  const error =
    estimatedRewardsError ??
    allocationOfError ??
    totalAllocationError ??
    backerTotalAllocationError ??
    cycleRewardsError

  return {
    data: abi,
    isLoading,
    error,
  }
}
