import { BackingCell, BackingCellProps } from '../Cell/BackingCell'
import { BackingShareCell } from '../Cell/BackingShareCell'
import {
  MobileColumnItem,
  MobileDataSection,
  MobileSectionWrapper,
  MobileTwoColumnWrapper,
} from './MobileDataSection'

export const MobileBackingSection = ({
  backing,
  backingPercentage,
  showShare = false,
  showUsd = true,
  className,
  isRowSelected = false,
}: {
  backing: BackingCellProps
  backingPercentage?: number
  showShare?: boolean
  showUsd?: boolean
  className?: string
  isRowSelected?: boolean
}) => {
  const hasBackingValue = backing.amount != null
  const hasShareValue = backingPercentage != null

  if (showShare) {
    return (
      <MobileTwoColumnWrapper className={className}>
        <MobileColumnItem>
          <MobileSectionWrapper title="Backing" hasValue={hasBackingValue} isRowSelected={isRowSelected}>
            <BackingCell {...backing} showUsd={showUsd} showTokenLabel={true} />
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
      <BackingCell {...backing} showUsd={showUsd} showTokenLabel={true} />
    </MobileDataSection>
  )
}
