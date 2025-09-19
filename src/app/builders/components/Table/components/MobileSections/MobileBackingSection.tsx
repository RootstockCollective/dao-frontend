import { FC } from 'react'
import { BackingCell, BackingCellProps } from '../../Cell/BackingCell'
import { BackingShareCell } from '../../Cell/BackingShareCell'
import {
  MobileDataSection,
  MobileTwoColumnWrapper,
  MobileColumnItem,
  MobileSectionWrapper,
} from './MobileDataSection'
import { hasValidValue } from '../../utils/builderRowUtils'

export const MobileBackingSection: FC<{
  backing: BackingCellProps
  backingPercentage?: number
  showShare?: boolean
  showUsd?: boolean
  className?: string
}> = ({ backing, backingPercentage, showShare = false, showUsd = true, className }) => {
  const hasBackingValue = hasValidValue(backing.amount)
  const hasShareValue = hasValidValue(backingPercentage)

  if (showShare) {
    return (
      <MobileTwoColumnWrapper className={className}>
        <MobileColumnItem>
          <MobileSectionWrapper title="Backing" hasValue={hasBackingValue}>
            <BackingCell {...backing} showUsd={showUsd} />
          </MobileSectionWrapper>
        </MobileColumnItem>
        <MobileColumnItem>
          <MobileSectionWrapper title="Backing share" hasValue={hasShareValue}>
            <BackingShareCell backingPercentage={backingPercentage} />
          </MobileSectionWrapper>
        </MobileColumnItem>
      </MobileTwoColumnWrapper>
    )
  }

  return (
    <MobileDataSection title="Backing" hasValue={hasBackingValue} className={className}>
      <BackingCell {...backing} showUsd={showUsd} />
    </MobileDataSection>
  )
}
