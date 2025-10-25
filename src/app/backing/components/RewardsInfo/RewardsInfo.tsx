import { TokenRewards } from '@/app/collective-rewards/rewards/types'
import { weiToPercentage } from '@/app/collective-rewards/settings/utils'
import { getCombinedFiatAmount, getFiatAmount } from '@/app/collective-rewards/utils'
import { Paragraph } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { FC } from 'react'
import { BackerRewardsPercentage } from '../BackerPercentage/BackerRewardsPercentage'
import { LabeledContent } from '../LabeledContent/LabeledContent'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { BackerRewardPercentage } from '@/app/collective-rewards/types'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { Tooltip } from '@/components/Tooltip'

export interface RewardsInfoProps {
  backerRewardPercentage?: BackerRewardPercentage
  estimatedRewards?: TokenRewards
}

export const RewardsInfo: FC<RewardsInfoProps> = ({ backerRewardPercentage, estimatedRewards }) => {
  const { current, next } = backerRewardPercentage ?? { current: 0n, next: 0n }
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
            <Paragraph>
              {formatCurrency(
                getCombinedFiatAmount([
                  estimatedRewards.rbtc.amount,
                  estimatedRewards.rif.amount,
                  estimatedRewards.usdrif.amount,
                ]),
              )}
            </Paragraph>
            <Tooltip
              side="top"
              className="z-10"
              text={
                <MetricTooltipContent
                  tokens={[
                    {
                      symbol: RBTC,
                      value: formatSymbol(estimatedRewards.rbtc.amount.value, RBTC),
                      fiatValue: getFiatAmount(estimatedRewards.rbtc.amount).toFixed(2),
                    },
                    {
                      symbol: RIF,
                      value: formatSymbol(estimatedRewards.rif.amount.value, RIF),
                      fiatValue: getFiatAmount(estimatedRewards.rif.amount).toFixed(2),
                    },
                    {
                      symbol: USDRIF,
                      value: formatSymbol(estimatedRewards.usdrif.amount.value, USDRIF),
                      fiatValue: getFiatAmount(estimatedRewards.usdrif.amount).toFixed(2),
                    },
                  ]}
                />
              }
            >
              <div className="flex flex-row items-center gap-2">
                <DottedUnderlineLabel className="font-normal">USD</DottedUnderlineLabel>
              </div>
            </Tooltip>
          </div>
        </LabeledContent>
      )}
    </div>
  )
}
