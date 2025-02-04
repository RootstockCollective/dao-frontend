import { FC, useMemo } from 'react'
import {
  MetricsCardWithSpinner,
  MetricsCardTitle,
  RewardDetails,
  MetricsCardContent,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useBackerTotalAllocation } from '@/app/collective-rewards/allocations/hooks'
import { WeiPerEther } from 'ethers'
import Big from '@/lib/big'
import {
  ABIFormula,
  useGetEstimatedBackersRewardsPct,
  useGaugesGetFunction,
  useGetCyclePayout,
} from '@/app/collective-rewards/shared'

type ABIProps = Omit<RewardDetails, 'gauge' | 'gauges'>

export const ABI: FC<ABIProps> = ({ builder }) => {
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
  } = useGaugesGetFunction(gauges, 'allocationOf', [builder])
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useGaugesGetFunction(gauges, 'totalAllocation')
  const {
    data: backerTotalAllocation,
    isLoading: backerTotalAllocationLoading,
    error: backerTotalAllocationError,
  } = useBackerTotalAllocation(builder)
  const { cyclePayout, isLoading: cyclePayoutLoading, error: cyclePayoutError } = useGetCyclePayout()

  const { prices } = usePricesContext()

  const abiPct = useMemo(() => {
    const backerRewards = builders.reduce((acc, { gauge, estimatedBackerRewardsPct }) => {
      const builderTotalAllocation = totalAllocation[gauge] ?? 0n
      const backerAllocationOf = allocationOf[gauge] ?? 0n

      const backersRewardsAmount = (estimatedBackerRewardsPct * cyclePayout) / WeiPerEther
      const backerReward = builderTotalAllocation
        ? (backersRewardsAmount * backerAllocationOf) / builderTotalAllocation
        : 0n

      return acc + backerReward
    }, 0n)

    const rifPrice = prices.RIF?.price ?? 0

    if (!rifPrice || !backerTotalAllocation) {
      return 0
    }

    const rewardsPerStRIFPerCycle = Big(backerRewards.toString()).div(backerTotalAllocation.toString())

    return (Math.pow(1 + rewardsPerStRIFPerCycle.toNumber() / rifPrice, 26) - 1) * 100
  }, [allocationOf, backerTotalAllocation, builders, cyclePayout, prices, totalAllocation])

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

  useHandleErrors({ error, title: 'Error loading backers abi' })

  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless>
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle
          title="Annual Backers Incentives %"
          data-testid="backerAbiPct"
          tooltip={{
            text: (
              <span className="font-rootstock-sans text-sm font-normal">
                Your Annual Backers Incentives (%) represents an estimate of the annualized percentage of
                rewards that you could receive based on your backing allocations.
                <br />
                <br />
                The calculation follows the formula:
                <span className="flex justify-center">
                  <ABIFormula />
                </span>
                <br />
                <br />
                This estimation is dynamic and may vary based on total rewards and user activity. This data is
                for informational purposes only.
              </span>
            ),
            popoverProps: {
              size: 'medium',
              position: 'left-bottom',
            },
          }}
        />
        <MetricsCardContent>{`${abiPct.toFixed(0)}%`}</MetricsCardContent>
      </div>
    </MetricsCardWithSpinner>
  )
}
