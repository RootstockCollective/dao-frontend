import { FC } from 'react'
import { RewardsCellLegacy, RewardsCellPropsLegacy } from '../Cell/RewardsCell'
import {
  MobileDataSection,
  MobileTwoColumnWrapper,
  MobileColumnItem,
  MobileSectionWrapper,
} from './MobileDataSection'
import { EmptyPlaceholder } from '@/components/Table/components'

const hasValidValue = (rewards: RewardsCellPropsLegacy) =>
  rewards.usdValue != null || rewards.rbtcValue != null || rewards.rifValue != null

export const MobileRewardsSection: FC<{
  rewards_past_cycle: RewardsCellPropsLegacy
  rewards_upcoming: RewardsCellPropsLegacy
  showBothColumns?: boolean
  isRowSelected?: boolean
}> = ({ rewards_past_cycle, rewards_upcoming, showBothColumns = true, isRowSelected = false }) => {
  const hasUpcomingValue = hasValidValue(rewards_upcoming)
  const hasPastValue = hasValidValue(rewards_past_cycle)

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
            <RewardsCellLegacy {...rewards_past_cycle} emptyPlaceholder={<EmptyPlaceholder />} />
          </MobileSectionWrapper>
        </MobileColumnItem>
        <MobileColumnItem>
          <MobileSectionWrapper
            title="Rewards"
            subtitle="upcoming cycle, estimated"
            hasValue={hasUpcomingValue}
            isRowSelected={isRowSelected}
          >
            <RewardsCellLegacy {...rewards_upcoming} emptyPlaceholder={<EmptyPlaceholder />} />
          </MobileSectionWrapper>
        </MobileColumnItem>
      </MobileTwoColumnWrapper>
    )
  }

  return (
    <MobileDataSection title="Rewards - upcoming" hasValue={hasUpcomingValue} isRowSelected={isRowSelected}>
      <RewardsCellLegacy {...rewards_upcoming} emptyPlaceholder={<EmptyPlaceholder />} />
    </MobileDataSection>
  )
}
