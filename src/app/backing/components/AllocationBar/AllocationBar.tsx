'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, pointerWithin } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

import { calculateNewSegmentValues, calculateSegmentPositions, clamp } from './utils'
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

  // Handle resize logic
  const handleResize = ({ clientX }: MouseEvent) => {
    if (dragIndex === null || !barRef.current) return

    const rect = barRef.current.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)

    const { leftPx, rightPx } = calculateSegmentPositions(dragIndex, rect, values)
    const { leftValue, rightValue } = calculateNewSegmentValues(x, leftPx, rightPx, dragIndex, values)

    // Update the values
    const newValues = [...values]
    newValues[dragIndex] = leftValue
    newValues[dragIndex + 1] = rightValue
    setValues(newValues)
  }

  // End drag
  const onMouseUp = () => setDragIndex(null)

  useEffect(() => {
    if (dragIndex !== null) {
      window.addEventListener('mousemove', handleResize)
      window.addEventListener('mouseup', onMouseUp)
    } else {
      window.removeEventListener('mousemove', handleResize)
      window.removeEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleResize)
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
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
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
