// Checkerboard style generator
export const checkerboardStyle = (): React.CSSProperties => ({
  backgroundImage: `
      linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%),
      linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%)
    `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,10px 10px',
})

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

// Calculate pixel positions for the segments being resized
export const calculateSegmentPositions = (dragIndex: number, rect: DOMRect, values: number[]) => {
  let cumSum = 0
  for (let i = 0; i < dragIndex; ++i) cumSum += values[i]
  const leftPx = (cumSum / 100) * rect.width
  const rightPx = ((cumSum + values[dragIndex] + values[dragIndex + 1]) / 100) * rect.width
  return { leftPx, rightPx }
}

// Calculate the new values for the segments being resized
export const calculateNewSegmentValues = (
  x: number,
  leftPx: number,
  rightPx: number,
  dragIndex: number,
  values: number[],
) => {
  const pairSum = values[dragIndex] + values[dragIndex + 1]
  const totalPairPx = rightPx - leftPx
  const minLeftPx = (MIN_SEGMENT_PERCENT / pairSum) * totalPairPx
  const maxLeftPx = totalPairPx - minLeftPx

  // Calculate the handle's x relative to leftPx
  let relX = clamp(x - leftPx, minLeftPx, maxLeftPx)

  // Convert back to percentage and round to whole numbers
  let leftValue = Math.round((relX / totalPairPx) * pairSum)
  let rightValue = pairSum - leftValue

  // Ensure minimum segment sizes
  if (leftValue < MIN_SEGMENT_PERCENT) {
    leftValue = Math.ceil(MIN_SEGMENT_PERCENT)
    rightValue = pairSum - leftValue
  } else if (rightValue < MIN_SEGMENT_PERCENT) {
    rightValue = Math.ceil(MIN_SEGMENT_PERCENT)
    leftValue = pairSum - rightValue
  }

  return { leftValue, rightValue }
}

export const MIN_SEGMENT_PERCENT = 0
