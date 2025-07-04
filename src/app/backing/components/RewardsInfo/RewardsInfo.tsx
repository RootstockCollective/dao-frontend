import { BackerRewardPercentage, TokenRewards } from '@/app/collective-rewards/rewards/types'
import { weiToPercentage } from '@/app/collective-rewards/settings/utils'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { Paragraph } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { FC } from 'react'
import { BackerRewardsPercentage } from '../BackerPercentage/BackerRewardsPercentage'
import { LabeledContent } from '../LabeledContent/LabeledContent'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'

export interface RewardsInfoProps extends BackerRewardPercentage {
  estimatedRewards?: TokenRewards
}

export const RewardsInfo: FC<RewardsInfoProps> = ({ current, next, estimatedRewards }) => {
  return (
    <div className="flex justify-between p-3 w-full" data-testid="rewardsInfoContainer">
      <LabeledContent label="Rewards %" className="w-1/2 pr-3">
        <BackerRewardsPercentage
          currentPct={Number(weiToPercentage(current, 0))}
          nextPct={Number(weiToPercentage(next, 0))}
        />
      </LabeledContent>
      {estimatedRewards && (
        <LabeledContent label="Rewards (est.)" className="w-1/2">
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
