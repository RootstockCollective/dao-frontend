import { TokenRewards } from '@/app/collective-rewards/rewards/types'
import { weiToPercentage } from '@/app/collective-rewards/settings/utils'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { Paragraph } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { FC } from 'react'
import { BackerRewardsPercentage } from '../BackerPercentage/BackerRewardsPercentage'
import { LabeledContent } from '../LabeledContent/LabeledContent'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { BackerRewardPercentage } from '@/app/collective-rewards/types'

export interface RewardsInfoProps {
  backerRewardPercentage?: BackerRewardPercentage
  estimatedRewards?: TokenRewards
}

export const RewardsInfo: FC<RewardsInfoProps> = ({ backerRewardPercentage, estimatedRewards }) => {
  const { current, next } = backerRewardPercentage ?? { current: 0n, next: 0n }

  return (
    <div
      className="flex justify-between w-full border-b border-v3-bg-accent-40 p-3"
      data-testid="rewardsInfoContainer"
    >
      <LabeledContent label="Rewards %" className="basis-1/2 pr-3">
        <BackerRewardsPercentage
          currentPct={Number(weiToPercentage(current, 0))}
          nextPct={Number(weiToPercentage(next, 0))}
        />
      </LabeledContent>
      {estimatedRewards && (
        <LabeledContent label="Rewards (est.)" className="basis-1/2">
          <div className="flex flex-row items-center gap-2">
            <Paragraph>
              {formatCurrency(
                getCombinedFiatAmount([estimatedRewards.rbtc.amount, estimatedRewards.rif.amount]),
              )}
            </Paragraph>
            <RifRbtcTooltip
              rbtcValue={estimatedRewards.rbtc.amount.value}
              rifValue={estimatedRewards.rif.amount.value}
            >
              <DottedUnderlineLabel className="font-normal">USD</DottedUnderlineLabel>
            </RifRbtcTooltip>
          </div>
        </LabeledContent>
      )}
    </div>
  )
}
