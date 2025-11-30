import { CommonComponentProps } from '@/components/commonProps'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AllocationBarDragHandle } from './AllocationBarDragHandle'
import { AllocationBarTooltip, AllocationBarTooltipProps } from './AllocationBarTooltip'
import { AllocationBarValueDisplay, AllocationItem } from './types'
import { checkerboardStyle, valueToPercentage } from './utils'

type AllocationBarSegmentPercentProps = {
  pendingValue: bigint
  totalBacking: bigint
  valueDisplay: AllocationBarValueDisplay
  item: AllocationItem
  onchainValue: bigint
}

const AllocationBarSegmentPercent = ({
  pendingValue,
  totalBacking,
  valueDisplay,
}: AllocationBarSegmentPercentProps) => {
  const { percentDecimals, valueDecimals } = valueDisplay.format ?? {}

  const percent = valueToPercentage(pendingValue, totalBacking).toLocaleString(undefined, {
    maximumFractionDigits: percentDecimals ?? 2,
  })

  const formattedValue = pendingValue.toLocaleString(undefined, {
    maximumFractionDigits: valueDecimals ?? 2,
  })

  const { showValue, showPercent } = valueDisplay

  let displayValue = ''
  if (showValue) displayValue += formattedValue
  if (showPercent) displayValue += showValue ? ` (${percent}%)` : `${percent}%`

  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap font-normal leading-5 text-v3-bg-accent-0 font-rootstock-sans">
      {displayValue}
    </span>
  )
}

interface AllocationBarSegmentProps extends CommonComponentProps {
  pendingValue: bigint
  onchainValue: bigint
  totalBacking: bigint
  item: AllocationItem
  valueDisplay: AllocationBarValueDisplay
  tooltipContentProps: AllocationBarTooltipProps
  isCollapsed: boolean
  dragIndex: number | null
  isDraggable: boolean
  useModal?: boolean
  onModalOpen?: () => void
}

export const AllocationBarSegment = ({
  pendingValue,
  onchainValue,
  totalBacking,
  item,
  valueDisplay,
  tooltipContentProps,
  isCollapsed,
  dragIndex,
  isDraggable,
  className,
  useModal = false,
  onModalOpen,
}: AllocationBarSegmentProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: item.key,
  })

  // Calculate the percentage width based on the actual value and total value
  const percentageWidth = valueToPercentage(pendingValue, totalBacking)

  // For segments with very small values, ensure they have a minimum visible width
  // but only if the value is actually greater than 0
  const effectiveWidth = pendingValue > 0n && percentageWidth < 0.5 ? 0.5 : percentageWidth

  const style: React.CSSProperties = {
    ...(item.isTemporary ? checkerboardStyle() : {}),
    width: `${effectiveWidth}%`,
    transform: CSS.Translate.toString(transform),
    backgroundColor: item.displayColor,
  }

  const baseClasses = 'h-full relative overflow-visible flex items-stretch p-0 group'
  const roundedClasses = 'first:rounded-l-lg last:rounded-r-lg md:first:rounded-l-sm md:last:rounded-r-sm'
  const transitionClasses =
    dragIndex !== null ? 'transition-none' : 'transition-transform duration-200 ease-out'
  const dragStateClasses = isDragging ? 'opacity-60 z-[99]' : 'opacity-100'

  const handleSegmentClick = () => {
    if (useModal && onModalOpen) {
      onModalOpen()
    }
  }

  const segmentContent = (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(baseClasses, roundedClasses, transitionClasses, dragStateClasses, className)}
      onClick={useModal ? handleSegmentClick : undefined}
    >
      {/* DRAG HANDLE of the size of the segment */}
      {isDraggable && <AllocationBarDragHandle attributes={attributes} listeners={listeners} />}

      <div className="flex-1 flex items-center justify-center">
        {isCollapsed && !useModal && (
          <Tooltip text={<AllocationBarTooltip {...tooltipContentProps} />} side="top" align="center">
            <MoreIcon size={16} className="absolute -top-7 left-1/2 -translate-x-1/2  cursor-pointer z-10" />
          </Tooltip>
        )}
        {isCollapsed && useModal && (
          <MoreIcon size={16} className="absolute -top-7 left-1/2 -translate-x-1/2  cursor-pointer z-10" />
        )}
        {!isCollapsed && (
          <AllocationBarSegmentPercent
            pendingValue={pendingValue}
            totalBacking={totalBacking}
            valueDisplay={valueDisplay}
            item={item}
            onchainValue={onchainValue}
          />
        )}
      </div>
    </div>
  )

  // If using modal, don't wrap with tooltip
  if (useModal) {
    return segmentContent
  }

  return (
    <Tooltip
      hidden={isCollapsed}
      text={!isCollapsed && <AllocationBarTooltip {...tooltipContentProps} />}
      side="top"
      align="center"
    >
      {segmentContent}
    </Tooltip>
  )
}
