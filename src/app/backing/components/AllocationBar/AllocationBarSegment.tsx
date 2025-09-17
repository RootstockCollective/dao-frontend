import { MoreIcon } from '@/components/Icons/MoreIcon'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AllocationBarDragHandle } from './AllocationBarDragHandle'
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

interface AllocationBarSegmentProps {
  pendingValue: bigint
  onchainValue: bigint
  totalBacking: bigint
  item: AllocationItem
  index: number
  isLast: boolean
  valueDisplay: AllocationBarValueDisplay
  tooltip: () => React.ReactNode
  resizeHandle?: () => React.ReactNode
  isCollapsed: boolean
  dragIndex: number | null
  isDraggable: boolean
}

export const AllocationBarSegment = ({
  pendingValue,
  onchainValue,
  totalBacking,
  item,
  index,
  isLast,
  valueDisplay,
  tooltip: lazyTooltip,
  resizeHandle = () => null,
  isCollapsed,
  dragIndex,
  isDraggable,
}: AllocationBarSegmentProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: item.key })

  const ResizeHandle = resizeHandle()
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
  const transitionClasses =
    dragIndex !== null ? 'transition-none' : 'transition-transform duration-200 ease-out'
  const dragStateClasses = isDragging ? 'opacity-60 z-[99]' : 'opacity-100'
  const borderClasses = `${index === 0 ? 'rounded-l-sm' : ''} ${isLast ? 'rounded-r-sm' : ''}`
  const positionClasses = !isLast ? 'mr-2' : ''

  return (
    <Tooltip hidden={isCollapsed} text={!isCollapsed && lazyTooltip()} side="top" align="center">
      {
        <div
          ref={setNodeRef}
          style={style}
          className={cn(baseClasses, transitionClasses, dragStateClasses, borderClasses, positionClasses)}
        >
          {/* DRAG HANDLE of the size of the segment */}
          {isDraggable && <AllocationBarDragHandle attributes={attributes} listeners={listeners} />}

          <div className="flex-1 flex items-center justify-center">
            {isCollapsed ? (
              <Tooltip text={lazyTooltip()} side="top" align="center" className="z-10 text-lg">
                <MoreIcon
                  size={16}
                  className="absolute -top-7 left-1/2 -translate-x-1/2  cursor-pointer z-10"
                />
              </Tooltip>
            ) : (
              <AllocationBarSegmentPercent
                pendingValue={pendingValue}
                totalBacking={totalBacking}
                valueDisplay={valueDisplay}
                item={item}
                onchainValue={onchainValue}
              />
            )}
          </div>
          {ResizeHandle}
        </div>
      }
    </Tooltip>
  )
}
