import { Paragraph } from '@/components/TypographyNew'
import { BackerRewardsPercentage } from '../BackerPercentage/BackerPercentage'
import { FC } from 'react'
import { LabeledContent } from '../LabeledContent/LabeledContent'

// FIXME: reuse the Builder type
interface RewardsInfoProps {
  builderRewardPct: number
  builderNextRewardPct?: number
  estimatedRewards?: string
}

export const RewardsInfo: FC<RewardsInfoProps> = ({
  builderRewardPct,
  builderNextRewardPct,
  estimatedRewards,
}) => {
  return (
    <div className="flex justify-between p-3 w-full" data-testid="rewardsInfoContainer">
      <LabeledContent label="Rewards %" className="w-1/2 pr-3">
        <BackerRewardsPercentage currentPct={builderRewardPct} nextPct={builderNextRewardPct} />
      </LabeledContent>
      {estimatedRewards && (
        <LabeledContent label="Rewards (est.)" className="w-1/2">
          {/* FIXME: we should include here a popover that shows the estimated rewards in RIF and RBTC */}
          <Paragraph data-testid="rewardsInfoEstimated">{estimatedRewards}</Paragraph>
        </LabeledContent>
      )}
    </div>
  )
}
