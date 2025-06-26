import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AllocationBarDragHandle } from './AllocationBarDragHandle'
import { AllocationBarResizeHandle } from './AllocationBarResizeHandle'
import { AllocationBarValueDisplay, AllocationItem } from './types'
import { checkerboardStyle, valueToPercentage } from './utils'

const AllocationBarSegmentPercent = ({
  value,
  totalValue,
  valueDisplay,
}: {
  value: number
  totalValue: number
  valueDisplay: AllocationBarValueDisplay
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

  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap font-normal leading-5 text-v3-bg-accent-0 font-rootstock-sans">
      {displayValue}
    </span>
  )
}

interface AllocationBarSegmentProps {
  value: number
  totalValue: number
  item: AllocationItem
  index: number
  isLast: boolean
  valueDisplay: AllocationBarValueDisplay
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
  isDraggable: boolean
  isResizable: boolean
}

export const AllocationBarSegment = ({
  value,
  totalValue,
  item,
  index,
  isLast,
  valueDisplay,
  onHandleMouseDown,
  dragIndex,
  isDraggable,
  isResizable,
}: AllocationBarSegmentProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: item.key })

  // Calculate the percentage width based on the actual value and total value
  const percentageWidth = valueToPercentage(value, totalValue)

  const style: React.CSSProperties = {
    ...(item.isTemporary ? checkerboardStyle() : {}),
    width: `${percentageWidth}%`,
    transform: CSS.Translate.toString(transform),
    backgroundColor: item.displayColor,
  }

  const baseClasses = 'min-w-12 h-full relative overflow-visible flex items-stretch p-0'
  const transitionClasses =
    dragIndex !== null ? 'transition-none' : 'transition-transform duration-200 ease-out'
  const dragStateClasses = isDragging ? 'opacity-60 z-[99]' : 'opacity-100 z-1'
  const borderClasses = `${index === 0 ? 'rounded-l-sm' : ''} ${isLast ? 'rounded-r-sm' : ''}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${baseClasses}
        ${transitionClasses}
        ${dragStateClasses}
        ${borderClasses}
      `.trim()}
    >
      {/* DRAG HANDLE (always far left) */}
      {isDraggable && <AllocationBarDragHandle attributes={attributes} listeners={listeners} />}

      <div className="flex-1 flex items-center justify-center relative">
        {<AllocationBarSegmentPercent value={value} totalValue={totalValue} valueDisplay={valueDisplay} />}
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
