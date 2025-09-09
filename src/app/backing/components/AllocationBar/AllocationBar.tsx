import { DndContext, DragEndEvent, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useEffect, useRef, useState } from 'react'

import { Legend } from '@/components/Legend'
import { cn } from '@/lib/utils'
import { AllocationBarSegment } from './AllocationBarSegment'
import { AllocationBarProps } from './types'
import {
  calculateMinSegmentValue,
  calculateNewSegmentValues,
  calculateSegmentPositions,
  clamp,
  valueToPercentage,
} from './utils'

const getSegmentsToShowDots = (values: bigint[], totalValue: bigint): boolean[] => {
  const NEIGHBOR_SUM_THRESHOLD = 8 // 8%
  const segmentsToShowDots = new Array(values.length).fill(false)

  for (let i = 0; i < values.length; i++) {
    const currentPercentage = valueToPercentage(values[i], totalValue)

    // Check if current segment has a neighbor and their sum is up to the threshold
    const hasSmallNeighborSum =
      (i > 0 && currentPercentage + valueToPercentage(values[i - 1], totalValue) <= NEIGHBOR_SUM_THRESHOLD) ||
      (i < values.length - 1 &&
        currentPercentage + valueToPercentage(values[i + 1], totalValue) <= NEIGHBOR_SUM_THRESHOLD)

    segmentsToShowDots[i] = hasSmallNeighborSum
  }

  return segmentsToShowDots
}

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

  const totalBacking = currentValues.reduce((sum, v) => sum + v, 0n)
  const minSegmentValue = calculateMinSegmentValue(totalBacking)

  // Calculate which segments should show dots
  const segmentsToShowDots = getSegmentsToShowDots(currentValues, totalBacking)

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

    const { leftPx, rightPx } = calculateSegmentPositions(dragIndex, rect, currentValues, totalBacking)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className={cn('w-full p-8 flex flex-col gap-6', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <SortableContext items={currentItems.map(item => item.key)} strategy={horizontalListSortingStrategy}>
          {/* TODO: this should grow from the bottom to the top, but now it grows from the top to the bottom */}
          <div
            className="flex items-end w-full relative select-none transition-[height] duration-300 ease-in-out"
            ref={barRef}
            style={{ height }}
          >
            {currentItems.map((item, i) => (
              <AllocationBarSegment
                key={item.key}
                pendingValue={currentValues[i]}
                onchainValue={item.initialValue ?? 0n}
                totalBacking={totalBacking}
                item={item}
                index={i}
                isLast={i === currentItems.length - 1}
                valueDisplay={valueDisplay}
                onHandleMouseDown={onHandleMouseDown}
                dragIndex={dragIndex}
                isDraggable={isDraggable}
                isResizable={isResizable}
                showDots={segmentsToShowDots[i]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {showLegend && <Legend title="Total:" items={currentItems} />}
    </div>
  )
}

export default AllocationBar
