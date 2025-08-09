import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AllocationBarDragHandle } from './AllocationBarDragHandle'
import { AllocationBarResizeHandle } from './AllocationBarResizeHandle'
import { AllocationBarValueDisplay, AllocationItem } from './types'
import { checkerboardStyle, valueToPercentage } from './utils'
import { AllocationBarTooltip } from './AllocationBarTooltip'
import { Tooltip } from '@/components/Tooltip'
import { MoreIcon } from '@/components/Icons/MoreIcon'

const AllocationBarSegmentPercent = ({
  value,
  totalValue,
  valueDisplay,
  showDots = false,
}: {
  value: number
  totalValue: number
  valueDisplay: AllocationBarValueDisplay
  showDots?: boolean
}) => {
  const { percentDecimals, valueDecimals } = valueDisplay.format ?? {}

  const percent = valueToPercentage(value, totalValue).toLocaleString(undefined, {
    maximumFractionDigits: percentDecimals ?? 2,
  })

  const formattedValue = value.toLocaleString(undefined, {
    maximumFractionDigits: valueDecimals ?? 2,
  })

  const { showValue, showPercent } = valueDisplay

  let displayValue = ''
  if (showValue) displayValue += formattedValue
  if (showPercent) displayValue += showValue ? ` (${percent}%)` : `${percent}%`

  if (showDots) {
    return (
      <Tooltip text={displayValue} side="top" align="center" className="p-4 z-10 text-lg">
        <MoreIcon size={16} className="absolute -top-7 left-1/2 -translate-x-1/2  cursor-pointer z-10" />
      </Tooltip>
    )
  }

  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap font-normal leading-5 text-v3-bg-accent-0 font-rootstock-sans">
      {displayValue}
    </span>
  )
}

interface AllocationBarSegmentProps {
  value: number
  initialValue: number
  totalValue: number
  item: AllocationItem
  index: number
  isLast: boolean
  valueDisplay: AllocationBarValueDisplay
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
  isDraggable: boolean
  isResizable: boolean
  showDots?: boolean
}

export const AllocationBarSegment = ({
  value,
  initialValue,
  totalValue,
  item,
  index,
  isLast,
  valueDisplay,
  onHandleMouseDown,
  dragIndex,
  isDraggable,
  isResizable,
  showDots,
}: AllocationBarSegmentProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: item.key })

  // Calculate the percentage width based on the actual value and total value
  const percentageWidth = valueToPercentage(value, totalValue)

  // For segments with very small values, ensure they have a minimum visible width
  // but only if the value is actually greater than 0
  const effectiveWidth = value > 0 && percentageWidth < 0.5 ? 0.5 : percentageWidth

  const style: React.CSSProperties = {
    ...(item.isTemporary ? checkerboardStyle() : {}),
    width: `${effectiveWidth}%`,
    transform: CSS.Translate.toString(transform),
    backgroundColor: item.displayColor,
  }

  const baseClasses = 'h-full relative overflow-visible flex items-stretch p-0 group'
  const transitionClasses =
    dragIndex !== null ? 'transition-none' : 'transition-transform duration-200 ease-out'
  const dragStateClasses = isDragging ? 'opacity-60' : 'opacity-100'
  const borderClasses = `${index === 0 ? 'rounded-l-sm' : ''} ${isLast ? 'rounded-r-sm' : ''}`
  const positionClasses = !isLast ? 'mr-2' : ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${baseClasses}
        ${transitionClasses}
        ${dragStateClasses}
        ${borderClasses}
        ${positionClasses}
      `.trim()}
    >
      {/* DRAG HANDLE of the size of the segment */}
      {isDraggable && (
        <div className="group relative w-full h-full">
          <AllocationBarDragHandle attributes={attributes} listeners={listeners} />

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
            <div className="rounded-sm bg-v3-text-80 text-v3-bg-accent-60 px-2 py-1 text-xs font-normal shadow-lg font-rootstock-sans">
              <AllocationBarTooltip
                isTemporary={item.isTemporary}
                builderAddress={item.key}
                currentBacking={value}
                pendingBacking={initialValue}
              />
            </div>
          </div>
        </div>
      )}

      <Tooltip
        text={
          <AllocationBarTooltip
            isTemporary={item.isTemporary}
            builderAddress={item.key}
            currentBacking={value}
            pendingBacking={initialValue}
          />
        }
        side="top"
        align="center"
      >
        <div className="flex-1 flex items-center justify-center">
          <AllocationBarSegmentPercent
            value={value}
            totalValue={totalValue}
            valueDisplay={valueDisplay}
            showDots={showDots}
          />
        </div>
      </Tooltip>

      {/* RESIZE HANDLE (far right, not overlapping drag handle) */}
      {!isLast && isResizable && (
        <AllocationBarResizeHandle
          onHandleMouseDown={onHandleMouseDown}
          dragIndex={dragIndex}
          index={index}
        />
      )}
    </div>
  )
}
