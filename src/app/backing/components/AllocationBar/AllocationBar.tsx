import React, { useRef, useState, useEffect } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, pointerWithin } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

import {
  calculateMinSegmentValue,
  calculateNewSegmentValues,
  calculateSegmentPositions,
  clamp,
} from './utils'
import { AllocationBarProps } from './types'
import { AllocationBarSegment } from './AllocationBarSegment'
import { Legend } from '@/components/Legend'

const AllocationBar: React.FC<AllocationBarProps> = ({
  itemsData,
  height = '96px',
  isDraggable = true,
  isResizable = true,
  valueDisplay = {
    showPercent: true,
    format: { percentDecimals: 0 },
  },
  showLegend = true,
  className = '',
  onChange,
}) => {
  const isControlled = typeof onChange === 'function'
  const [localItemsData, setLocalItemsData] = useState(itemsData)
  const [localValues, setLocalValues] = useState(itemsData.map(item => item.value))

  // Reactive current state
  const currentItems = isControlled ? itemsData : localItemsData
  const currentValues = isControlled ? itemsData.map(item => item.value) : localValues

  const totalValue = currentValues.reduce((sum, v) => sum + v, 0)
  const minSegmentValue = calculateMinSegmentValue(totalValue)

  const barRef = useRef<HTMLDivElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  // Start drag handler
  const onHandleMouseDown = (idx: number) => (e: React.MouseEvent) => {
    setDragIndex(idx)
    e.preventDefault()
  }

  // Handle resize logic
  const handleResize = ({ clientX }: MouseEvent) => {
    if (dragIndex === null || !barRef.current) return

    const rect = barRef.current.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)

    const { leftPx, rightPx } = calculateSegmentPositions(dragIndex, rect, currentValues, totalValue)
    const { leftValue, rightValue } = calculateNewSegmentValues(
      x,
      leftPx,
      rightPx,
      dragIndex,
      currentValues,
      minSegmentValue,
    )

    const newValues = [...currentValues]
    newValues[dragIndex] = leftValue
    newValues[dragIndex + 1] = rightValue

    const increasedIndex = leftValue > currentValues[dragIndex] ? dragIndex : dragIndex + 1
    const decreasedIndex = increasedIndex === dragIndex ? dragIndex + 1 : dragIndex

    if (isControlled) {
      onChange?.({
        type: 'resize',
        values: newValues,
        itemsData: currentItems,
        increasedIndex,
        decreasedIndex,
      })
    } else {
      setLocalValues(newValues)
    }
  }

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
  }, [dragIndex, currentValues])

  // dnd-kit reorder logic
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const oldIndex = currentItems.findIndex(item => item.key === active.id)
    const newIndex = currentItems.findIndex(item => item.key === over.id)

    const newItems = arrayMove(currentItems, oldIndex, newIndex)
    const newValues = arrayMove(currentValues, oldIndex, newIndex)

    if (isControlled) {
      onChange?.({
        type: 'reorder',
        values: newValues,
        itemsData: newItems,
        increasedIndex: 0,
        decreasedIndex: 0,
      })
    } else {
      setLocalItemsData(newItems)
      setLocalValues(newValues)
    }
  }

  return (
    <div className={`w-full p-8 ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <SortableContext items={currentItems.map(item => item.key)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center w-full mb-4 relative select-none" ref={barRef} style={{ height }}>
            {currentItems.map((item, i) => (
              <AllocationBarSegment
                key={item.key}
                value={currentValues[i]}
                totalValue={totalValue}
                item={item}
                index={i}
                isLast={i === currentItems.length - 1}
                valueDisplay={valueDisplay}
                onHandleMouseDown={onHandleMouseDown}
                dragIndex={dragIndex}
                isDraggable={isDraggable}
                isResizable={isResizable}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {showLegend && <Legend title="Total portfolio:" items={currentItems} />}
    </div>
  )
}

export default AllocationBar
