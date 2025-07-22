import { useGetBuilderRewardsClaimedLogs, useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { useMemo } from 'react'
import { Address } from 'viem'

interface UseBuilderAllTimeShareProps {
  gauge: Address
  gauges: Address[]
  rifAddress: Address
}

interface AllTimeShareData {
  amount: string
  isLoading: boolean
  error: Error | null
}

export const useGetBuilderAllTimeShare = ({
  gauge,
  gauges,
  rifAddress,
}: UseBuilderAllTimeShareProps): AllTimeShareData => {
  const {
    data: notifyReward,
    isLoading: notifyRewardLoading,
    error: notifyRewardError,
  } = useGetGaugesNotifyReward(gauges, rifAddress)

  const {
    data: builderRewardsPerToken,
    isLoading: builderRewardsPerTokenLoading,
    error: builderRewardsPerTokenError,
  } = useGetBuilderRewardsClaimedLogs(gauge)

  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rifAddress] })

  // Calculate the percentage using useMemo for performance optimization
  const amount = useMemo(() => {
    // Calculate builder's claimed rewards
    const builderClaimedRewards =
      builderRewardsPerToken[rifAddress]?.reduce((acc, event) => {
        const amount = event.args.amount_
        return acc + amount
      }, 0n) ?? 0n

    // Calculate total builder rewards (claimed + claimable)
    const totalBuilderRewards = builderClaimedRewards + (claimableRewards ?? 0n)

    // Calculate total notify rewards across all gauges
    const notifyRewards = Object.values(notifyReward).reduce(
      (acc, events) =>
        acc +
        events.reduce(
          (acc, { args: { backersAmount_, builderAmount_ } }) => acc + backersAmount_ + builderAmount_,
          0n,
        ),
      0n,
    )

    // Calculate the percentage
    return !notifyRewards ? '0%' : `${(totalBuilderRewards * 100n) / notifyRewards}%`
  }, [builderRewardsPerToken, claimableRewards, notifyReward, rifAddress])

  return {
    amount,
    isLoading: notifyRewardLoading || builderRewardsPerTokenLoading || claimableRewardsLoading,
    error: notifyRewardError || builderRewardsPerTokenError || claimableRewardsError,
  }
}
