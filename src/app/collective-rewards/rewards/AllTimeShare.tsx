import { Address } from 'viem'
import { FC, ReactNode } from 'react'
import {
  useGetNotifyRewardLogs,
  useGetGaugeNotifyRewardLogs,
  useGetBuilderRewards,
  MetricsCardWithSpinner,
  MetricsCardTitle,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Typography } from '@/components/Typography'

type AllTimeShareProps = {
  gauge: Address
  data: {
    [token: string]: {
      symbol: string
      address: Address
    }
  }
}

type MetricsCardContentProps = {
  children: ReactNode
}

const MetricsCardContent: FC<MetricsCardContentProps> = ({ children }) => (
  <Typography
    tagVariant="h2"
    paddingBottom="2px"
    paddingTop="10px"
    lineHeight="28.8px"
    fontFamily="kk-topo"
    className="text-[48px] text-primary font-normal"
    data-testid="Amount"
  >
    {children}
  </Typography>
)

export const AllTimeShare: FC<AllTimeShareProps> = ({ gauge, data: { rif } }) => {
  const { data: rewardsPerToken, isLoading: logsLoading, error: rewardsError } = useGetNotifyRewardLogs()
  const {
    data: gaugeRewardsPerToken,
    isLoading: gaugeLogsLoading,
    error: gaugeRewardsError,
  } = useGetGaugeNotifyRewardLogs(gauge)
  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useGetBuilderRewards(rif.address, gauge)

  const error = rewardsError ?? gaugeRewardsError ?? claimableRewardsError

  useHandleErrors({ error, title: 'Error loading all time share' })

  let isLoading: boolean = logsLoading || gaugeLogsLoading || claimableRewardsLoading

  if (!rewardsPerToken[rif.address] || !gaugeRewardsPerToken[rif.address]) {
    return (
      <MetricsCardWithSpinner isLoading={isLoading} borderless>
        <MetricsCardTitle title="All time share" data-testid="AllTimeShare" />
        <MetricsCardContent>0%</MetricsCardContent>
      </MetricsCardWithSpinner>
    )
  }

  const rifRewards = rewardsPerToken[rif.address].reduce((acc, event) => {
    const amount = event.args.amount_
    return acc + amount
  }, 0n)
  const gaugeRifRewards = gaugeRewardsPerToken[rif.address].reduce((acc, event) => {
    const amount = event.args.builderAmount_
    return acc + amount
  }, 0n)

  const totalRewards = gaugeRifRewards + (claimableRewards ?? 0n)

  const amount = !rifRewards ? '0%' : `${(totalRewards * 100n) / rifRewards}%`

  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless>
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle title="All time share" data-testid="AllTimeShare" />
        <MetricsCardContent>{amount}</MetricsCardContent>
      </div>
    </MetricsCardWithSpinner>
  )
}
