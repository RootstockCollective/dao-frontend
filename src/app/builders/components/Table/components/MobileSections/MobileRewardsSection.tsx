import { FC } from 'react'
import { RewardsCell, RewardsCellProps } from '../../Cell/RewardsCell'
import {
  MobileDataSection,
  MobileTwoColumnWrapper,
  MobileColumnItem,
  MobileSectionWrapper,
} from './MobileDataSection'
import { EmptyPlaceholder } from '@/components/Table/components'

export const MobileRewardsSection: FC<{
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  showBothColumns?: boolean
  isRowSelected?: boolean
}> = ({ rewards_past_cycle, rewards_upcoming, showBothColumns = true, isRowSelected = false }) => {
  const hasUpcomingValue =
    rewards_upcoming.usdValue != null ||
    rewards_upcoming.rbtcValue != null ||
    rewards_upcoming.rifValue != null
  const hasPastValue =
    rewards_past_cycle.usdValue != null ||
    rewards_past_cycle.rbtcValue != null ||
    rewards_past_cycle.rifValue != null

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
