import { useGetRewardsERC20 } from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetTotalAllocation } from '../../../hooks/useGetTotalAllocation'
import { useBuilderContext, useGetGaugesArrayByType } from '@/app/collective-rewards/user'

export const useGetABI = () => {
  const { data: cyclePayout, isLoading: isCyclePayoutLoading, error: cyclePayoutError } = useGetRewardsERC20()
  const { data: builders } = useBuilderContext()
  // FIXME: verify if this filter is correct
  // activatedBuilders already include the backer rewards percentage
  const activatedBuilders = builders.filter(builder => builder.stateFlags?.activated === false)
  // FIXME: for each builder, get votes allocated to that builder and calculate the weighted average
  const weightedAverageBuilderRewardsPct = 0n

  const { data: gauges } = useGetGaugesArrayByType('active')
  const {
    data: totalAllocation,
    isLoading: isTotalAllocationLoading,
    error: totalAllocationError,
  } = useGetTotalAllocation(gauges ?? [])
  // FIXME: verify if we need to use the cyclePayout in wei or in RIF and if we need to use bigint or Number
  const rewardsPerStRIFPerCycle = Number(
    ((cyclePayout ?? 1n) * weightedAverageBuilderRewardsPct) / totalAllocation,
  )
  const { prices } = usePricesContext()
  const rifPrice = prices.RIF?.price ?? 0
  const abi = rifPrice ? Math.pow(1 + rewardsPerStRIFPerCycle / rifPrice, 26) - 1 : 0

  const isLoading = isCyclePayoutLoading || isTotalAllocationLoading
  const error = cyclePayoutError ?? totalAllocationError
  return {
    data: abi,
    isLoading,
    error,
  }
}
