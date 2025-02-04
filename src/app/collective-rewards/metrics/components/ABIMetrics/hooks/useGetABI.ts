import { useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { useGaugesGetFunction, useGetCyclePayout } from '@/app/collective-rewards/shared'
import { formatEther } from 'viem'
import { useMemo } from 'react'

export const useGetABI = () => {
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

  const { prices } = usePricesContext()

  const abi = useMemo(() => {
    const sumTotalAllocation = Object.values(totalAllocation).reduce((acc, value) => acc + (value ?? 0n), 0n)

    if (!sumTotalAllocation) {
      return 0
    }

    const rifPrice = prices.RIF?.price ?? 0

    if (!rifPrice) {
      return 0
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

    const rewardsPerStRIFPerCycle = Number(
      formatEther((cyclePayout * weightedAverageBuilderRewardsPct) / sumTotalAllocation),
    )

    return (Math.pow(1 + rewardsPerStRIFPerCycle / rifPrice, 26) - 1) * 100
  }, [backersRewardsPct, builders, cyclePayout, prices, totalAllocation])

  const isLoading =
    buildersLoading || cyclePayoutLoading || totalAllocationLoading || backersRewardsPctLoading

  const error = buildersError ?? cyclePayoutError ?? totalAllocationError ?? backersRewardsPctError

  return {
    data: abi,
    isLoading,
    error,
  }
}
