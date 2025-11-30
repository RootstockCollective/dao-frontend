import { DndContext, DragEndEvent, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { AllocationBarTooltip, AllocationBarTooltipProps } from './AllocationBarTooltip'
import { Tooltip } from '@/components/Tooltip'
import React, { Fragment, useEffect, useRef, useState } from 'react'

import { Legend } from '@/components/Legend'
import { cn } from '@/lib/utils'
import { AllocationBarSegment } from './AllocationBarSegment'
import { ResizeHandle } from './ResizeHandle'
import { AllocationBarProps, AllocationItem } from './types'
import {
  calculateMinSegmentValue,
  calculateNewSegmentValues,
  calculateSegmentPositions,
  clamp,
  valueToPercentage,
} from './utils'
import { BackingDetailsModal } from './BackingDetailsModal'

const getSegmentsCollapsedState = (values: bigint[], totalValue: bigint): boolean[] => {
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
  useModal = false,
}) => {
  const isControlled = typeof onChange === 'function'
  const [localItemsData, setLocalItemsData] = useState(itemsData)
  const [localValues, setLocalValues] = useState(itemsData.map(item => item.value))
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Reactive current state
  const currentItems = isControlled ? itemsData : localItemsData
  const currentValues = isControlled ? itemsData.map(item => item.value) : localValues

  const totalBacking = currentValues.reduce((sum, v) => sum + v, 0n)
  const minSegmentValue = calculateMinSegmentValue(totalBacking)

  const barRef = useRef<HTMLDivElement>(null)
  const [dragTargetIndex, setDragTarget] = useState<number | null>(null)

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  // Start drag handler
  const onHandleMouseDown = (idx: number) => {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragTarget(idx)
    }
  }

  // Handle resize logic
  const handleResize = ({ clientX }: MouseEvent) => {
    if (dragTargetIndex === null || !barRef.current) return

    const targetSegment = currentItems.at(dragTargetIndex)
    const adjacentSegment = currentItems.at(dragTargetIndex + 1)

    // Prevent resizing if either of the involved segments is not editable
    if (!(adjacentSegment?.isEditable && targetSegment?.isEditable)) {
      return
    }

    const rect = barRef.current.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)

    const { leftPx, rightPx } = calculateSegmentPositions(dragTargetIndex, rect, currentValues, totalBacking)
    const { leftValue: targetSegmentValue, rightValue: adjecentSegmentValue } = calculateNewSegmentValues(
      x,
      leftPx,
      rightPx,
      dragTargetIndex,
      currentValues,
      minSegmentValue,
    )

    const newValues = [...currentValues]
    newValues[dragTargetIndex] = targetSegmentValue
    newValues[dragTargetIndex + 1] = adjecentSegmentValue

    const increasedIndex =
      targetSegmentValue > currentValues[dragTargetIndex] ? dragTargetIndex : dragTargetIndex + 1
    const decreasedIndex = increasedIndex === dragTargetIndex ? dragTargetIndex + 1 : dragTargetIndex

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

  const onMouseUp = () => setDragTarget(null)

  useEffect(() => {
    if (dragTargetIndex !== null) {
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
  }, [dragTargetIndex, currentValues])

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

  const collapsedSegments: boolean[] = getSegmentsCollapsedState(currentValues, totalBacking)

  return (
    <div className={cn('w-full p-0 mb-4 md:p-8 md:mb-0 flex flex-col gap-6', className)}>
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
              <Fragment key={item.key}>
                <AllocationBarSegment
                  key={item.key}
                  pendingValue={currentValues[i]}
                  onchainValue={item.initialValue ?? 0n}
                  totalBacking={totalBacking}
                  item={item}
                  valueDisplay={valueDisplay}
                  isCollapsed={collapsedSegments[i]}
                  tooltipContentProps={getTooltipProps(dragTargetIndex, item, currentItems)}
                  dragIndex={dragTargetIndex}
                  isDraggable={isDraggable}
                  useModal={useModal}
                  onModalOpen={() => setIsModalOpen(true)}
                />
                {i < currentItems.length - 1 && isResizable && (
                  <Tooltip
                    text={<AllocationBarTooltip {...getTooltipProps(dragTargetIndex, item, currentItems)} />}
                    // reduce layout jumps/jitters when numbers change
                    className="whitespace-nowrap [font-variant-numeric:tabular-nums]"
                    side="top"
                    align="center"
                  >
                    <ResizeHandle
                      onMouseDown={onHandleMouseDown(i)}
                      isEditable={item.isEditable && currentItems[i + 1].isEditable}
                      isHighlighted={dragTargetIndex === i}
                    />
                  </Tooltip>
                )}
              </Fragment>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {showLegend && <Legend title="Total:" items={currentItems} />}

      {useModal && (
        <BackingDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemsData={currentItems}
          totalBacking={totalBacking}
        />
      )}
    </div>
  )
}

const getTooltipProps = (
  dragTargetIndex: number | null,
  targetItem: AllocationItem,
  allItems: AllocationItem[],
): AllocationBarTooltipProps => {
  const isDragging = dragTargetIndex !== null

  return {
    targetItem: isDragging ? allItems[dragTargetIndex] : targetItem,
    adjacentItem: isDragging ? allItems[dragTargetIndex + 1] : undefined,
    isResizing: isDragging,
  }
}

export default AllocationBar
