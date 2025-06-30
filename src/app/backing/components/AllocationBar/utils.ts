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
export const calculateSegmentPositions = (
  dragIndex: number,
  rect: DOMRect,
  values: number[],
  totalValue: number,
) => {
  let cumSum = 0
  for (let i = 0; i < dragIndex; ++i) cumSum += values[i]
  const leftPx = (cumSum / totalValue) * rect.width
  const rightPx = ((cumSum + values[dragIndex] + values[dragIndex + 1]) / totalValue) * rect.width
  return { leftPx, rightPx }
}

// Calculate the new values for the segments being resized
export const calculateNewSegmentValues = (
  x: number,
  leftPx: number,
  rightPx: number,
  dragIndex: number,
  values: number[],
  minSegmentValue: number = 0,
) => {
  const pairSum = values[dragIndex] + values[dragIndex + 1]
  const totalPairPx = rightPx - leftPx
  const minLeftPx = pairSum > 0 ? (minSegmentValue / pairSum) * totalPairPx : 0
  const maxLeftPx = totalPairPx - minLeftPx

  // Calculate the handle's x relative to leftPx
  let relX = clamp(x - leftPx, minLeftPx, maxLeftPx)

  // Convert back to actual value
  let leftValue = Math.round((relX / totalPairPx) * pairSum)
  let rightValue = pairSum - leftValue

  // Ensure minimum segment sizes
  if (leftValue < minSegmentValue) {
    leftValue = Math.ceil(minSegmentValue)
    rightValue = pairSum - leftValue
  } else if (rightValue < minSegmentValue) {
    rightValue = Math.ceil(minSegmentValue)
    leftValue = pairSum - rightValue
  }

  return { leftValue, rightValue }
}

// Convert actual value to percentage for display
export const valueToPercentage = (value: number, totalValue: number): number => {
  return totalValue > 0 && value > 0 ? (value / totalValue) * 100 : 0
}

// Calculate minimum segment value based on total value and minimum percentage
export const calculateMinSegmentValue = (totalValue: number, minPercentage: number = 0): number => {
  return (minPercentage / 100) * totalValue
}
