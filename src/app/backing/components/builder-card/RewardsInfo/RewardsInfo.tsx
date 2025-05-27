import { Paragraph } from '@/components/TypographyNew'
import { BackerRewardsPercentage } from '../BackerPercentage/BackerPercentage'
import { FC } from 'react'
import { LabeledContent } from '../LabeledContent/LabeledContent'

interface RewardsInfoProps {
  builderRewardPct: number
  builderNextRewardPct?: number
  estimatedRewards?: string
  testId?: string
}

export const RewardsInfo: FC<RewardsInfoProps> = ({
  builderRewardPct,
  builderNextRewardPct,
  estimatedRewards,
  testId = '',
}) => {
  return (
    <div className="flex justify-between p-3 w-full" data-testid={`${testId}rewardsInfoContainer`}>
      <LabeledContent label="Rewards %" className="w-1/2 pr-3" testId={`${testId}rewardsInfo`}>
        <BackerRewardsPercentage
          currentPct={builderRewardPct}
          nextPct={builderNextRewardPct}
          testId={`${testId}rewardsInfo`}
        />
      </LabeledContent>
      {estimatedRewards && (
        <LabeledContent label="Rewards (est.)" className="w-1/2" testId={`${testId}rewardsInfo`}>
          <Paragraph data-testid={`${testId}rewardsInfoEstimated`}>{estimatedRewards}</Paragraph>
        </LabeledContent>
      )}
    </div>
  )
}
