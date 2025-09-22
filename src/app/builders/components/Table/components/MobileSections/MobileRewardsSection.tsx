import { FC } from 'react'
import { RewardsCell, RewardsCellProps } from '../../Cell/RewardsCell'
import {
  MobileDataSection,
  MobileTwoColumnWrapper,
  MobileColumnItem,
  MobileSectionWrapper,
  EmptyPlaceholder,
} from './MobileDataSection'
import { hasValidValue } from '../../utils/builderRowUtils'

export const MobileRewardsSection: FC<{
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  showBothColumns?: boolean
  isRowSelected?: boolean
}> = ({ rewards_past_cycle, rewards_upcoming, showBothColumns = true, isRowSelected = false }) => {
  const hasUpcomingValue =
    hasValidValue(rewards_upcoming.usdValue) ||
    hasValidValue(rewards_upcoming.rbtcValue) ||
    hasValidValue(rewards_upcoming.rifValue)
  const hasPastValue =
    hasValidValue(rewards_past_cycle.usdValue) ||
    hasValidValue(rewards_past_cycle.rbtcValue) ||
    hasValidValue(rewards_past_cycle.rifValue)

  if (showBothColumns) {
    return (
      <MobileTwoColumnWrapper>
        <MobileColumnItem>
          <MobileSectionWrapper
            title="Rewards"
            subtitle="past cycle"
            hasValue={hasPastValue}
            isRowSelected={isRowSelected}
          >
            <RewardsCell {...rewards_past_cycle} emptyPlaceholder={<EmptyPlaceholder />} />
          </MobileSectionWrapper>
        </MobileColumnItem>
        <MobileColumnItem>
          <MobileSectionWrapper
            title="Rewards"
            subtitle="upcoming cycle, estimated"
            hasValue={hasUpcomingValue}
            isRowSelected={isRowSelected}
          >
            <RewardsCell {...rewards_upcoming} emptyPlaceholder={<EmptyPlaceholder />} />
          </MobileSectionWrapper>
        </MobileColumnItem>
      </MobileTwoColumnWrapper>
    )
  }

  return (
    <MobileDataSection title="Rewards - upcoming" hasValue={hasUpcomingValue} isRowSelected={isRowSelected}>
      <RewardsCell {...rewards_upcoming} emptyPlaceholder={<EmptyPlaceholder />} />
    </MobileDataSection>
  )
}
