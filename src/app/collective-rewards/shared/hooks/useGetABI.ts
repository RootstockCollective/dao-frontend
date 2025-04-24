import { useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import {
  useGaugesGetFunction,
  useGetCyclePayout,
  useGetEstimatedBackersRewardsPct,
} from '@/app/collective-rewards/shared'
import { Address } from 'viem'
import { useMemo } from 'react'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { useBackerTotalAllocation } from '@/app/collective-rewards/allocations/hooks'

const useGetAbi = (rewardsPerStRif: bigint) => {
  const { prices } = usePricesContext()
  const rifPrice = prices.RIF?.price ?? 0

  if (!rifPrice) {
    return 0
  }

  return Big(1)
    .add(Big(rewardsPerStRif.toString()).div(WeiPerEther.toString()).div(rifPrice))
    .pow(26)
    .minus(1)
    .mul(100)
}

export const useGetRewardsAbi = (backer: Address) => {
  const {
    data: builders,
    isLoading: estimatedBackerRewardsPctLoading,
    error: estimatedBackerRewardsPctError,
  } = useGetEstimatedBackersRewardsPct()
  const gauges = builders.map(({ gauge }) => gauge)
  const {
    data: allocationOf,
    isLoading: allocationOfLoading,
    error: allocationOfError,
  } = useGaugesGetFunction(gauges, 'allocationOf', [backer])
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useGaugesGetFunction(gauges, 'totalAllocation')
  const {
    data: backerTotalAllocation,
    isLoading: backerTotalAllocationLoading,
    error: backerTotalAllocationError,
  } = useBackerTotalAllocation(backer)
  const { cyclePayout, isLoading: cyclePayoutLoading, error: cyclePayoutError } = useGetCyclePayout()

  const rewardsPerStRif = useMemo(() => {
    const backerRewards = builders.reduce((acc, { gauge, estimatedBackerRewardsPct }) => {
      const builderTotalAllocation = totalAllocation[gauge] ?? 0n
      const backerAllocationOf = allocationOf[gauge] ?? 0n

      const backersRewardsAmount = (estimatedBackerRewardsPct * cyclePayout) / WeiPerEther
      const backerReward = builderTotalAllocation
        ? (backersRewardsAmount * backerAllocationOf) / builderTotalAllocation
        : 0n

      return acc + backerReward
    }, 0n)

    if (!backerTotalAllocation) {
      return 0n
    }

    return (backerRewards * WeiPerEther) / backerTotalAllocation
  }, [allocationOf, backerTotalAllocation, builders, cyclePayout, totalAllocation])

  const isLoading =
    estimatedBackerRewardsPctLoading ||
    allocationOfLoading ||
    totalAllocationLoading ||
    backerTotalAllocationLoading ||
    cyclePayoutLoading

  const error =
    estimatedBackerRewardsPctError ??
    allocationOfError ??
    totalAllocationError ??
    backerTotalAllocationError ??
    cyclePayoutError

  const abi = useGetAbi(rewardsPerStRif)

  return {
    data: abi,
    isLoading,
    error,
  }
}

export const useGetMetricsAbi = () => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>({
    activated: true,
    communityApproved: true,
    kycApproved: true,
    revoked: false,
  })

  const gauges = builders.map(({ gauge }) => gauge)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useGaugesGetFunction(gauges, 'totalAllocation')

  const buildersAddress = builders.map(({ address }) => address)
  const {
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress)
  const { cyclePayout, isLoading: cyclePayoutLoading, error: cyclePayoutError } = useGetCyclePayout()

  const rewardsPerStRif = useMemo(() => {
    const sumTotalAllocation = Object.values(totalAllocation).reduce((acc, value) => acc + (value ?? 0n), 0n)

    if (!sumTotalAllocation) {
      return 0n
    }

    const topFiveBuilders = builders
      .reduce<Array<{ allocation: bigint; current: bigint }>>((acc, builder) => {
        const allocation = totalAllocation[builder.gauge]
        const rewardPct = backersRewardsPct[builder.address]
        if (allocation && rewardPct) {
          acc.push({ allocation, current: rewardPct.current })
        }
        return acc
      }, [])
      .sort((a, b) => (a.allocation > b.allocation ? -1 : 1))
      .slice(0, 5)

    // We use the multiplication with the current backer rewards % to avoid losing precision
    // Thats why we don't need to multiply by 100
    const weightedAverageBuilderRewardsPct = topFiveBuilders.reduce(
      (acc, { allocation, current }) => acc + (allocation * current) / sumTotalAllocation,
      0n,
    )

    return (cyclePayout * weightedAverageBuilderRewardsPct) / sumTotalAllocation
  }, [backersRewardsPct, builders, cyclePayout, totalAllocation])

  const isLoading =
    buildersLoading || cyclePayoutLoading || totalAllocationLoading || backersRewardsPctLoading

  const error = buildersError ?? cyclePayoutError ?? totalAllocationError ?? backersRewardsPctError

  const abi = useGetAbi(rewardsPerStRif)

  return {
    data: abi,
    isLoading,
    error,
  }
}
