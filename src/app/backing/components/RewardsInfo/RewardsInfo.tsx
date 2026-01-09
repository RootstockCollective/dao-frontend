import { TokenRewards } from '@/app/collective-rewards/rewards/types'
import { weiToPercentage } from '@/app/collective-rewards/settings/utils'
import { BackerRewardPercentage } from '@/app/collective-rewards/types'
import { FiatTooltipLabel } from '@/app/components'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { getMetricTokens } from '@/app/shared/utils'
import { Paragraph } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { FC, useMemo } from 'react'
import { BackerRewardsPercentage } from '../BackerPercentage/BackerRewardsPercentage'
import { LabeledContent } from '../LabeledContent/LabeledContent'

export interface RewardsInfoProps {
  backerRewardPercentage?: BackerRewardPercentage
  estimatedRewards?: TokenRewards
}

export const RewardsInfo: FC<RewardsInfoProps> = ({ backerRewardPercentage, estimatedRewards }) => {
  const { current, next } = backerRewardPercentage ?? { current: 0n, next: 0n }
  const { prices } = usePricesContext()

  const { metricTokens, total } = useMemo(
    () =>
      getMetricTokens(
        {
          rif: estimatedRewards?.rif.amount.value ?? 0n,
          rbtc: estimatedRewards?.rbtc.amount.value ?? 0n,
          usdrif: estimatedRewards?.usdrif.amount.value ?? 0n,
        },
        prices,
      ),
    [estimatedRewards, prices],
  )

  return (
    <div
      className="flex justify-between w-full border-b border-v3-bg-accent-40 p-3 gap-3"
      data-testid="rewardsInfoContainer"
    >
      <LabeledContent label="Rewards %" className="basis-1/2">
        <BackerRewardsPercentage
          currentPct={Number(weiToPercentage(current, 0))}
          nextPct={Number(weiToPercentage(next, 0))}
        />
      </LabeledContent>
      {estimatedRewards && (
        <LabeledContent label="Rewards (est.)" className="">
          <div className="flex flex-row items-center gap-2">
            <Paragraph>{formatCurrency(total)}</Paragraph>
            <FiatTooltipLabel
              tooltip={{
                side: 'top',
                text: <MetricTooltipContent tokens={metricTokens} />,
              }}
            />
          </div>
        </LabeledContent>
      )}
    </div>
  )
}
