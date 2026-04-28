import { BackersPercentageCell, BackersPercentageProps } from '../Cell/BackersPercentageCell'
import { MobileDataSection } from './MobileDataSection'

export const MobileBackerRewardsSection = ({
  backer_rewards,
  showChangeIndicator = false,
  isRowSelected = false,
}: {
  backer_rewards: BackersPercentageProps
  showChangeIndicator?: boolean
  isRowSelected?: boolean
}) => {
  const hasValue = backer_rewards.percentage?.current != null

  return (
    <MobileDataSection
      title="Backer Rewards %"
      subtitle={showChangeIndicator ? 'current % - change' : undefined}
      hasValue={hasValue}
      isRowSelected={isRowSelected}
    >
      <BackersPercentageCell {...backer_rewards} />
    </MobileDataSection>
  )
}
