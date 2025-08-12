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
  item,
  initialValue,
}: {
  value: bigint
  totalValue: bigint
  valueDisplay: AllocationBarValueDisplay
  showDots?: boolean
  item: AllocationItem
  initialValue: bigint
}) => {
  const { percentDecimals, valueDecimals } = valueDisplay.format ?? {}

  const percent = valueToPercentage(value, totalValue).toLocaleString(undefined, {
    maximumFractionDigits: percentDecimals ?? 2,
  })

  const formattedValue = Number(value).toLocaleString(undefined, {
    maximumFractionDigits: valueDecimals ?? 2,
  })

  const { showValue, showPercent } = valueDisplay

  let displayValue = ''
  if (showValue) displayValue += formattedValue
  if (showPercent) displayValue += showValue ? ` (${percent}%)` : `${percent}%`

  if (showDots) {
    return (
      <Tooltip
        text={
          <AllocationBarTooltip
            builderAddress={item.key}
            currentBacking={item.key === 'unallocated' ? value : initialValue}
            pendingBacking={item.isTemporary ? value : 0n}
            percentage={displayValue}
          />
        }
        side="top"
        align="center"
        className="z-10 text-lg"
      >
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
  value: bigint
  initialValue: bigint
  totalValue: bigint
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

  // console.log(item.label, percentageWidth);

  // For segments with very small values, ensure they have a minimum visible width
  // but only if the value is actually greater than 0
  const effectiveWidth = value > 0n && percentageWidth < 0.5 ? 0.5 : percentageWidth

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

  if (showDots) {
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
        {isDraggable && <AllocationBarDragHandle attributes={attributes} listeners={listeners} />}

        <div className="flex-1 flex items-center justify-center">
          <AllocationBarSegmentPercent
            value={value}
            totalValue={totalValue}
            valueDisplay={valueDisplay}
            showDots={showDots}
            item={item}
            initialValue={initialValue}
          />
        </div>

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

  return (
    <Tooltip
      text={
        <AllocationBarTooltip
          builderAddress={item.key}
          currentBacking={item.key === 'unallocated' ? value : initialValue}
          pendingBacking={item.isTemporary ? value : 0n}
        />
      }
      side="top"
      align="center"
    >
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
        {isDraggable && <AllocationBarDragHandle attributes={attributes} listeners={listeners} />}

        <div className="flex-1 flex items-center justify-center">
          <AllocationBarSegmentPercent
            value={value}
            totalValue={totalValue}
            valueDisplay={valueDisplay}
            showDots={showDots}
            item={item}
            initialValue={initialValue}
          />
        </div>

        {/* RESIZE HANDLE (far right, not overlapping drag handle) */}
        {!isLast && isResizable && (
          <AllocationBarResizeHandle
            onHandleMouseDown={onHandleMouseDown}
            dragIndex={dragIndex}
            index={index}
          />
        )}
      </div>
    </Tooltip>
  )
}
