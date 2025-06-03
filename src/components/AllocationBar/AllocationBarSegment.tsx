import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AllocationBarDragHandle } from './AllocationBarDragHandle'
import { AllocationBarResizeHandle } from './AllocationBarResizeHandle'
import { AllocationItem } from './types'
import { checkerboardStyle, MIN_SEGMENT_PERCENT } from './utils'

// Formats a number to display at most 2 decimal places, but preserves all decimals if there are fewer than 2
// Examples:
// formatValue(10) => 10
// formatValue(10.1) => 10.1
// formatValue(10.12) => 10.12
// formatValue(10.123) => 10.12
// formatValue(10.126) => 10.13
const formatValue = (val: number) => {
  if (Number.isInteger(val)) return val
  const decimals = val.toString().split('.')[1]?.length || 0
  return val.toFixed(Math.min(2, decimals))
}

const AllocationBarSegmentPercent = ({ value }: { value: number }) => {
  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-gray-300 text-lg font-normal pointer-events-none whitespace-nowrap">
      {formatValue(value)}%
    </span>
  )
}

interface AllocationBarSegmentProps {
  value: number
  item: AllocationItem
  index: number
  isLast: boolean
  showPercent: boolean
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
  isDraggable: boolean
  isResizable: boolean
}

export const AllocationBarSegment = ({
  value,
  item,
  index,
  isLast,
  showPercent,
  onHandleMouseDown,
  dragIndex,
  isDraggable,
  isResizable,
}: AllocationBarSegmentProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: item.key })

  const style: React.CSSProperties = {
    ...(item.isTemporary ? checkerboardStyle() : {}),
    width: `${Math.max(value, MIN_SEGMENT_PERCENT)}%`,
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      // TODO: we may need to review the transition here
      className={`min-w-12 h-full relative overflow-visible flex items-stretch p-0 ${dragIndex !== null ? 'transition-none' : 'transition-transform duration-200 ease-out'} ${isDragging ? 'opacity-60 z-[99]' : 'opacity-100 z-1'} ${index === 0 ? 'rounded-l-sm' : ''} ${isLast ? 'rounded-r-sm' : ''} ${item.color}`}
    >
      {/* DRAG HANDLE (always far left) */}
      {isDraggable && <AllocationBarDragHandle attributes={attributes} listeners={listeners} />}

      <div className="flex-1 flex items-center justify-center relative">
        {showPercent && <AllocationBarSegmentPercent value={value} />}
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
