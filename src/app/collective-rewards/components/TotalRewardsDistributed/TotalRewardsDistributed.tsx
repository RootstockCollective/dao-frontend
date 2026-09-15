import Big from 'big.js'

import { useGetTotalRewardsFromCycles, useGetTotalRewardsFromEvents } from '@/app/collective-rewards/rewards'
import { FiatTooltipLabel } from '@/app/components'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { withDataFallback } from '@/app/shared/components/Fallback'
import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricTitle } from '@/components/Metric'
import { Metric } from '@/components/Metric/Metric'
import { Header, Paragraph } from '@/components/Typography'
import { cn, formatCurrency } from '@/lib/utils'

interface TotalRewardsDistributedMetricProps extends CommonComponentProps {}

export interface TotalRewardsData {
  rewardPerToken: MetricToken[]
  combinedRewardsFiat: Big
}

const TotalRewardsLoader = withDataFallback<TotalRewardsData>(
  useGetTotalRewardsFromCycles,
  useGetTotalRewardsFromEvents,
)

export const TotalRewardsDistributed = ({ className }: TotalRewardsDistributedMetricProps) => (
  <TotalRewardsLoader
    render={({ data: { rewardPerToken, combinedRewardsFiat }, isLoading }) => {
      if (isLoading) return <LoadingSpinner size="small" />

      return (
        <Metric
          title={
            <MetricTitle
              title="Total Rewards Distributed"
              info={
                <Paragraph className="text-[14px] font-normal text-left">
                  Total rewards distributed to Builders and Backers
                </Paragraph>
              }
            />
          }
          className={cn(' gap-4', className)}
          containerClassName="gap-0 md:gap-2"
          contentClassName="flex flex-col gap-2"
        >
          <Header
            variant="h2"
            className="text-v3-text-100 overflow-hidden text-ellipsis leading-[125%] tracking-[0.03rem]"
          >
            {formatCurrency(combinedRewardsFiat, { showCurrencySymbol: false })}{' '}
            <FiatTooltipLabel
              tooltip={{ side: 'top', text: <MetricTooltipContent tokens={rewardPerToken} /> }}
            />
          </Header>
          <MetricBar segments={rewardPerToken} />
        </Metric>
      )
    }}
  />
)
