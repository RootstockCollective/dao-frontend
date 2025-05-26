'use client'
import React, { useEffect, useRef, useState } from 'react'

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
const checkerboardStyle = (baseColor: string): React.CSSProperties => ({
  backgroundImage: `
    linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%),
    linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,10px 10px',
})

// Props
interface AllocationBarProps {
  itemsData?: AllocationItem[]
  showPercent?: boolean
  showLegend?: boolean
  className?: string
  onChange?: (values: number[]) => void
}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

const MIN_SEGMENT_PERCENT = 0

const AllocationBar: React.FC<AllocationBarProps> = ({
  itemsData = [],
  showPercent = true,
  showLegend = true,
  className = '',
  onChange,
}) => {
  const initialValues = itemsData.map(item => item.value)
  const [values, setValues] = useState(initialValues)
  const barRef = useRef<HTMLDivElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

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

    // Compute absolute min/max for left segment in percent
    const minLeft = MIN_SEGMENT_PERCENT
    const maxLeft = pairSum - MIN_SEGMENT_PERCENT

    // The range for the draggable handle in px
    const minX = leftPx + (minLeft / pairSum) * (rightPx - leftPx)
    const maxX = leftPx + (maxLeft / pairSum) * (rightPx - leftPx)
    const clampedX = clamp(x, minX, maxX)

    // Handler position as a proportion between minX and maxX
    const ratio = (clampedX - minX) / (maxX - minX)
    const leftValue = minLeft + ratio * (maxLeft - minLeft)
    const rightValue = pairSum - leftValue

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

  return (
    <div className={`w-full p-8 ${className}`}>
      {/* Bar */}
      <div
        className="flex items-center w-full mb-4 relative select-none"
        ref={barRef}
        style={{ height: '96px' }}
      >
        {itemsData.map((item, i) => (
          <React.Fragment key={itemsData[i].key}>
            {/* Bar segment */}
            <div
              className={`h-full  ${i === 0 ? 'rounded-l-sm' : ''}  ${i === itemsData.length - 1 ? 'rounded-r-sm' : ''} ${itemsData[i].color}`}
              style={{
                ...(itemsData[i].isTemporary ? checkerboardStyle(itemsData[i].color) : {}),
                width: `${values[i]}%`,
                minWidth: '24px',
                transition: dragIndex !== null ? 'none' : 'width 0.2s',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {showPercent && (
                // TODO: put text color in a var
                <span
                  className="absolute -top-7 left-1/2 -translate-x-1/2 text-[#ACA39D] text-lg font-normal"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {Math.round(values[i])}%
                </span>
              )}
            </div>
            {/* Handler between segments */}
            {/* {i < allItems.length - 1 && (
              <div
                className={`w-2 flex flex-col items-center justify-center cursor-ew-resize ${allItems[i + 1]?.key !== 'unallocated' ? 'hover:cursor-col-resize' : 'hover:cursor-not-allowed'}`}
              >
                <div className="h-16 w-1 bg-gray-100 rounded"></div>
              </div>
            )} */}
            {i < values.length - 1 && (
              // TODO: make it undraggable if left is between 0
              <div
                className={`w-2 cursor-col-resize h-full flex items-center justify-center z-10 relative`}
                onMouseDown={onHandleMouseDown(i)}
                style={{ marginLeft: '0.2rem', marginRight: '0.2rem' }}
              >
                <div
                  className="h-5 w-1 bg-white rounded"
                  style={{
                    boxShadow: dragIndex === i ? '0 0 8px 2px #fff' : undefined,
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Legend */}
      {showLegend && (
        // TODO: set text color in var
        <div className="flex items-center justify-center space-x-4 mt-2 text-lg font-medium text-[#ACA39D]">
          <span>Total portfolio:</span>
          {itemsData.map(item => (
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
