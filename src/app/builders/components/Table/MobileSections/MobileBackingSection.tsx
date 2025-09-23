import { FC } from 'react'
import { BackingCell, BackingCellProps } from '../Cell/BackingCell'
import { BackingShareCell } from '../Cell/BackingShareCell'
import {
  MobileDataSection,
  MobileTwoColumnWrapper,
  MobileColumnItem,
  MobileSectionWrapper,
} from './MobileDataSection'

export const MobileBackingSection: FC<{
  backing: BackingCellProps
  backingPercentage?: number
  showShare?: boolean
  showUsd?: boolean
  className?: string
  isRowSelected?: boolean
}> = ({
  backing,
  backingPercentage,
  showShare = false,
  showUsd = true,
  className,
  isRowSelected = false,
}) => {
  const hasBackingValue = backing.amount != null
  const hasShareValue = backingPercentage != null

  if (showShare) {
    return (
      <MobileTwoColumnWrapper className={className}>
        <MobileColumnItem>
          <MobileSectionWrapper title="Backing" hasValue={hasBackingValue} isRowSelected={isRowSelected}>
            <BackingCell {...backing} showUsd={showUsd} />
          </MobileSectionWrapper>
        </MobileColumnItem>
        <MobileColumnItem>
          <MobileSectionWrapper title="Backing share" hasValue={hasShareValue} isRowSelected={isRowSelected}>
            <BackingShareCell backingPercentage={backingPercentage} />
          </MobileSectionWrapper>
        </MobileColumnItem>
      </MobileTwoColumnWrapper>
    )
  }

  return (
    <MobileDataSection
      title="Backing"
      hasValue={hasBackingValue}
      className={className}
      isRowSelected={isRowSelected}
    >
      <BackingCell {...backing} showUsd={showUsd} />
    </MobileDataSection>
  )
}
