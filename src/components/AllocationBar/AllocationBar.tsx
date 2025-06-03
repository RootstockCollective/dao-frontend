'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'

import { clamp, MIN_SEGMENT_PERCENT } from './utils'
import { AllocationBarProps, AllocationItem } from './types'
import { AllocationBarSegment } from './AllocationBarSegment'
import { AllocationLegend } from './AllocationBarLegend'

const AllocationBar: React.FC<AllocationBarProps> = ({
  initialItemsData = [],
  height = '96px',
  isDraggable = true,
  isResizable = true,
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
    // TODO: for now we use PointerSensor only, but we'll add TouchSensor later to support mobile
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  // Call onChange whenever values change
  useEffect(() => {
    if (onChange) onChange(values)
  }, [values, onChange])

  // Start drag
  const onHandleMouseDown = (idx: number) => (e: React.MouseEvent) => {
    setDragIndex(idx)
    e.preventDefault()
  }

  // Drag logic
  const onMouseMove = ({ clientX }: MouseEvent) => {
    if (dragIndex === null || !barRef.current) return

    const rect = barRef.current.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)

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
  function handleDragEnd({ active, over }: DragEndEvent) {
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
          <div className="flex items-center w-full mb-4 relative select-none" ref={barRef} style={{ height }}>
            {itemsData.map((item, i) => (
              <AllocationBarSegment
                key={item.key}
                value={values[i]}
                item={item}
                index={i}
                isLast={i === itemsData.length - 1}
                showPercent={showPercent}
                onHandleMouseDown={onHandleMouseDown}
                dragIndex={dragIndex}
                isDraggable={isDraggable}
                isResizable={isResizable}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {showLegend && <AllocationLegend items={initialItemsData} />}
    </div>
  )
}

export default AllocationBar
