import { useSortable } from '@dnd-kit/sortable'
import { AllocationItem } from './types'
import { checkerboardStyle, MIN_SEGMENT_PERCENT } from './utils'
import { CSS } from '@dnd-kit/utilities'
import { SixDotsIcon } from '@/components/Icons/SixDotsIcon'

const AllocationBarSegmentPercent = ({ value }: { value: number }) => {
  return (
    <span
      className="absolute -top-7 left-1/2 -translate-x-1/2 text-gray-300 text-lg font-normal pointer-events-none"
      style={{ whiteSpace: 'nowrap' }}
    >
      {Math.round(value)}%
    </span>
  )
}

const AllocationBarSegmentResizeHandle = ({
  onHandleMouseDown,
  dragIndex,
  index,
}: {
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
  index: number
}) => {
  return (
    <div
      className="w-2 cursor-ew-resize h-full flex items-center justify-center z-10 relative"
      onMouseDown={onHandleMouseDown(index)}
      style={{
        marginLeft: '0.2rem',
        marginRight: '0.2rem',
        background: 'transparent',
        position: 'absolute',
        right: -2,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        className="h-5 w-0.5 bg-white rounded"
        style={{
          boxShadow: dragIndex === index ? '0 0 8px 2px #fff' : undefined,
        }}
      />
    </div>
  )
}

export const AllocationBarSegment = ({
  value,
  item,
  index,
  isLast,
  showPercent,
  onHandleMouseDown,
  dragIndex,
}: {
  value: number
  item: AllocationItem
  index: number
  isLast: boolean
  showPercent: boolean
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: item.key })

  const style: React.CSSProperties = {
    ...(item.isTemporary ? checkerboardStyle() : {}),
    width: `${Math.max(value, MIN_SEGMENT_PERCENT)}%`,
    minWidth: '48px',
    transition: dragIndex !== null ? 'none' : 'width 0.2s',
    position: 'relative',
    overflow: 'visible',
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 99 : 1,
    transform: CSS.Translate.toString(transform),
    display: 'flex',
    alignItems: 'stretch',
    padding: 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-full group ${index === 0 ? 'rounded-l-sm' : ''} ${
        isLast ? 'rounded-r-sm' : ''
      } ${item.color} relative`}
    >
      {/* DRAG HANDLE (always far left) */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab flex items-center px-1 select-none"
        style={{
          userSelect: 'none',
          height: '100%',
          alignSelf: 'stretch',
          background: 'rgba(255,255,255,0.06)',
        }}
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        <SixDotsIcon />
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {showPercent && <AllocationBarSegmentPercent value={value} />}
      </div>

      {/* RESIZE HANDLE (far right, not overlapping drag handle) */}
      {!isLast && (
        <AllocationBarSegmentResizeHandle
          onHandleMouseDown={onHandleMouseDown}
          dragIndex={dragIndex}
          index={index}
        />
      )}
    </div>
  )
}
