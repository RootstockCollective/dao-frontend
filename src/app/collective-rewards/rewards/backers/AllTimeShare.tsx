import { FC } from 'react'
import {
  MetricsCardWithSpinner,
  MetricsCardTitle,
  RewardDetails,
  useBackerRewardsContext,
  MetricsCardContent,
  useGetGaugesNotifyReward,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'

type AllTimeShareProps = Omit<RewardDetails, 'builder' | 'gauge'>

export const AllTimeShare: FC<AllTimeShareProps> = ({ gauges, tokens: { rif } }) => {
  const {
    data: notifyReward,
    isLoading: notifyRewardLoading,
    error: notifyRewardError,
  } = useGetGaugesNotifyReward(gauges, rif.address)

  const {
    data: backerRewards,
    isLoading: backerRewardsLoading,
    error: backerRewardsError,
  } = useBackerRewardsContext()
  const { claimed, earned } = backerRewards[rif.address]

  const earnedRewards = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  const claimedRewards = Object.values(claimed).reduce(
    (acc, claimed) => acc + claimed.reduce((acc, event) => acc + event.args.amount_, 0n),
    0n,
  )
  const notifyRewards = Object.values(notifyReward).reduce(
    (acc, events) =>
      acc +
      events.reduce(
        (acc, { args: { backersAmount_, builderAmount_ } }) => acc + backersAmount_ + builderAmount_,
        0n,
      ),
    0n,
  )

  const error = notifyRewardError ?? backerRewardsError

  useHandleErrors({ error, title: 'Error loading all time share' })

  const isLoading = notifyRewardLoading || backerRewardsLoading

  const totalRewards = earnedRewards + claimedRewards
  const amount = !notifyRewards ? '0%' : `${(totalRewards * 100n) / notifyRewards}%`

  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless>
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle
          title="All time share"
          data-testid="AllTimeShare"
          tooltip={{
            text: 'Your share of all Backers’ rewards',
          }}
        />
        <MetricsCardContent>{amount}</MetricsCardContent>
      </div>
    </MetricsCardWithSpinner>
  )
}
