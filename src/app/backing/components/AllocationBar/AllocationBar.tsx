'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, pointerWithin } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

import {
  calculateMinSegmentValue,
  calculateNewSegmentValues,
  calculateSegmentPositions,
  clamp,
} from './utils'
import { AllocationBarProps, AllocationItem } from './types'
import { AllocationBarSegment } from './AllocationBarSegment'
import { Legend } from '@/components/Legend'

const AllocationBar: React.FC<AllocationBarProps> = ({
  initialItemsData = [],
  height = '96px',
  isDraggable = true,
  isResizable = true,
  valueDisplay = {
    showPercent: true,
    format: {
      percentDecimals: 0,
    },
  },
  showLegend = true,
  className = '',
  onChange,
}) => {
  const initialValues = initialItemsData.map(item => item.value)
  const totalValue = initialItemsData.reduce((sum, item) => sum + item.value, 0)
  const minSegmentValue = calculateMinSegmentValue(totalValue)

  const [values, setValues] = useState(initialValues)
  const [itemsData, setItemsData] = useState<AllocationItem[]>([...initialItemsData])
  const barRef = useRef<HTMLDivElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [lastResizeInfo, setLastResizeInfo] = useState<{
    increasedIndex: number
    decreasedIndex: number
  } | null>(null)
  const itemOrderRef = useRef<string[]>(initialItemsData.map(item => item.key))

  // dnd-kit sensors
  const sensors = useSensors(
    // TODO: for now we use PointerSensor only, but we'll add TouchSensor later to support mobile
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  useEffect(() => {
    const newKeys = initialItemsData.map(item => item.key)

    const keysChanged =
      newKeys.length !== itemOrderRef.current.length ||
      !newKeys.every(key => itemOrderRef.current.includes(key))

    if (keysChanged) {
      itemOrderRef.current = newKeys
      setItemsData([...initialItemsData])
      setValues(initialItemsData.map(item => item.value))
    } else {
      const orderedItems = itemOrderRef.current
        .map(key => initialItemsData.find(item => item.key === key))
        .filter((item): item is AllocationItem => item !== undefined)

      setItemsData(orderedItems)
      setValues(orderedItems.map(item => item.value))
    }
  }, [initialItemsData])

  useEffect(() => {
    if (lastResizeInfo && onChange) {
      onChange({
        values,
        itemsData,
        increasedIndex: lastResizeInfo.increasedIndex,
        decreasedIndex: lastResizeInfo.decreasedIndex,
        totalValue,
      })
      setLastResizeInfo(null)
    }
  }, [values, lastResizeInfo, onChange, itemsData, totalValue])

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

    const { leftPx, rightPx } = calculateSegmentPositions(dragIndex, rect, values, totalValue)
    const { leftValue, rightValue } = calculateNewSegmentValues(
      x,
      leftPx,
      rightPx,
      dragIndex,
      values,
      minSegmentValue,
    )

    // Update the values
    const newValues = [...values]
    newValues[dragIndex] = leftValue
    newValues[dragIndex + 1] = rightValue

    const increasedIndex = leftValue > values[dragIndex] ? dragIndex : dragIndex + 1
    const decreasedIndex = increasedIndex === dragIndex ? dragIndex + 1 : dragIndex

    setValues(newValues)
    setLastResizeInfo({ increasedIndex, decreasedIndex })
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

    const newItems = arrayMove(itemsData, oldIndex, newIndex)
    const newValues = arrayMove(values, oldIndex, newIndex)

    itemOrderRef.current = newItems.map(item => item.key)

    setItemsData(newItems)
    setValues(newValues)
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
                totalValue={totalValue}
                item={item}
                index={i}
                isLast={i === itemsData.length - 1}
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
      {showLegend && <Legend title="Total portfolio:" items={itemsData} />}
    </div>
  )
}

export default AllocationBar
