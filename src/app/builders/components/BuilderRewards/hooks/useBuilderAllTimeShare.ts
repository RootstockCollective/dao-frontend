import { useGetBuilderRewardsClaimedLogs, useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { Token } from '@/app/collective-rewards/rewards'

interface UseBuilderAllTimeShareProps {
  gauge: Address
  gauges: Address[]
  tokens: {
    rif: Token
  }
}

interface AllTimeShareData {
  amount: string
  isLoading: boolean
}

export const useBuilderAllTimeShare = ({
  gauge,
  gauges,
  tokens: { rif },
}: UseBuilderAllTimeShareProps): AllTimeShareData => {
  const {
    data: notifyReward,
    isLoading: notifyRewardLoading,
    error: notifyRewardError,
  } = useGetGaugesNotifyReward(gauges, rif.address)

  const {
    data: builderRewardsPerToken,
    isLoading: builderRewardsPerTokenLoading,
    error: builderRewardsPerTokenError,
  } = useGetBuilderRewardsClaimedLogs(gauge)

  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rif.address] })

  useHandleErrors({ error: notifyRewardError, title: 'Error loading all time share (notify reward)' })
  useHandleErrors({
    error: builderRewardsPerTokenError,
    title: 'Error loading all time share (claimed logs)',
  })
  useHandleErrors({ error: claimableRewardsError, title: 'Error loading all time share (claimable)' })

  // Calculate builder's claimed rewards
  const builderClaimedRewards =
    builderRewardsPerToken[rif.address]?.reduce((acc, event) => {
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
  const amount = !notifyRewards ? '0%' : `${(totalBuilderRewards * 100n) / notifyRewards}%`

  return {
    amount,
    isLoading: notifyRewardLoading || builderRewardsPerTokenLoading || claimableRewardsLoading,
  }
}
