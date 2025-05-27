'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Type for each allocation item
export interface AllocationItem {
  key: string
  label: string
  value: number // percentage
  color: string // Tailwind class for color
  displayColor: string // Hex or Tailwind for dot
  isTemporary?: boolean
}

// Checkerboard style generator
const checkerboardStyle = (): React.CSSProperties => ({
  backgroundImage: `
    linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%),
    linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,10px 10px',
})

// Props
interface AllocationBarProps {
  initialItemsData?: AllocationItem[]
  showPercent?: boolean
  showLegend?: boolean
  className?: string
  onChange?: (values: number[]) => void
}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

const MIN_SEGMENT_PERCENT = 0

// -- Sortable Bar Segment Component --
function SortableBarSegment({
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
}) {
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
        {/* Six dots icon */}
        <svg width="16" height="36" className="text-gray-400" viewBox="0 0 16 36" fill="none">
          <circle cx="8" cy="6" r="2" fill="currentColor" />
          <circle cx="8" cy="14" r="2" fill="currentColor" />
          <circle cx="8" cy="22" r="2" fill="currentColor" />
          <circle cx="8" cy="30" r="2" fill="currentColor" />
        </svg>
      </div>

      {/* SEGMENT BODY */}
      <div className="flex-1 flex items-center justify-center relative">
        {showPercent && (
          <span
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-gray-300 text-lg font-normal pointer-events-none"
            style={{ whiteSpace: 'nowrap' }}
          >
            {Math.round(value)}%
          </span>
        )}
      </div>

      {/* RESIZE HANDLE (far right, not overlapping drag handle) */}
      {!isLast && (
        <div
          className={`w-2 cursor-col-resize h-full flex items-center justify-center z-10 relative`}
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
      )}
    </div>
  )
}

const AllocationBar: React.FC<AllocationBarProps> = ({
  initialItemsData = [],
  showPercent = true,
  showLegend = true,
  className = '',
  onChange,
}) => {
  const initialValues = initialItemsData.map(item => item.value)
  const [values, setValues] = useState(initialValues)
  const [itemsData, setItemsData] = useState<AllocationItem[]>([...initialItemsData])
  const barRef = useRef<HTMLDivElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  // Call onChange whenever values change
  useEffect(() => {
    if (onChange) onChange(values)
    // eslint-disable-next-line
  }, [values])

  // Start drag
  const onHandleMouseDown = (idx: number) => (e: React.MouseEvent) => {
    setDragIndex(idx)
    e.preventDefault()
  }

  // Drag logic
  const onMouseMove = (e: MouseEvent) => {
    if (dragIndex === null || !barRef.current) return

    const rect = barRef.current.getBoundingClientRect()
    const x = clamp(e.clientX - rect.left, 0, rect.width)

    // Calculate px positions
    let cumSum = 0
    for (let i = 0; i < dragIndex; ++i) cumSum += values[i]
    const leftPx = (cumSum / 100) * rect.width
    const rightPx = ((cumSum + values[dragIndex] + values[dragIndex + 1]) / 100) * rect.width

    // Boundaries to keep segments from getting too small
    const pairSum = values[dragIndex] + values[dragIndex + 1]

    // Handler position as a proportion between minX and maxX
    const totalPairPx = rightPx - leftPx
    const minLeftPx = (MIN_SEGMENT_PERCENT / pairSum) * totalPairPx
    const maxLeftPx = totalPairPx - minLeftPx

    // Calculate the handle's x relative to leftPx
    let relX = clamp(x - leftPx, minLeftPx, maxLeftPx)

    // Convert back to percentage
    let leftValue = (relX / totalPairPx) * pairSum
    let rightValue = pairSum - leftValue

    // Final clamp for safety (sometimes rounding can allow a fraction below min)
    if (leftValue < MIN_SEGMENT_PERCENT) {
      leftValue = MIN_SEGMENT_PERCENT
      rightValue = pairSum - leftValue
    } else if (rightValue < MIN_SEGMENT_PERCENT) {
      rightValue = MIN_SEGMENT_PERCENT
      leftValue = pairSum - rightValue
    }

    // Only update the two affected
    const newValues = [...values]
    newValues[dragIndex] = leftValue
    newValues[dragIndex + 1] = rightValue
    setValues(newValues)
  }

  // End drag
  const onMouseUp = () => setDragIndex(null)

  useEffect(() => {
    if (dragIndex !== null) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    } else {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    // eslint-disable-next-line
  }, [dragIndex, values])

  // dnd-kit sort logic
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = itemsData.findIndex(item => item.key === active.id)
    const newIndex = itemsData.findIndex(item => item.key === over.id)
    setItemsData(arrayMove(itemsData, oldIndex, newIndex))
    setValues(arrayMove(values, oldIndex, newIndex))
  }

  return (
    <div className={`w-full p-8 ${className}`}>
      {/* Bar */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemsData.map(item => item.key)} strategy={horizontalListSortingStrategy}>
          <div
            className="flex items-center w-full mb-4 relative select-none"
            ref={barRef}
            style={{ height: '96px' }}
          >
            {itemsData.map((item, i) => (
              <SortableBarSegment
                key={item.key}
                value={values[i]}
                item={item}
                index={i}
                isLast={i === itemsData.length - 1}
                showPercent={showPercent}
                onHandleMouseDown={onHandleMouseDown}
                dragIndex={dragIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* Legend */}
      {showLegend && (
        // TODO: set text color in var
        <div className="flex items-center justify-center space-x-4 mt-2 text-lg font-medium text-[#ACA39D]">
          <span>Total portfolio:</span>
          {initialItemsData.map(item => (
            <span key={item.key} className="flex items-center space-x-2">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: item.displayColor }}
              ></span>
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllocationBar
