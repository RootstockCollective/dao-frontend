import { FC } from 'react'
import { BackersPercentageCell, BackersPercentageProps } from '../../Cell/BackersPercentageCell'
import { MobileDataSection } from './MobileDataSection'
import { hasValidValue } from '../../utils/builderRowUtils'

export const MobileBackerRewardsSection: FC<{
  backer_rewards: BackersPercentageProps
  showChangeIndicator?: boolean
  isRowSelected?: boolean
}> = ({ backer_rewards, showChangeIndicator = false, isRowSelected = false }) => {
  const hasValue = hasValidValue(backer_rewards.percentage?.current)

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
