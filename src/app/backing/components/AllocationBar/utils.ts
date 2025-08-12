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
  values: bigint[],
  totalValue: bigint,
) => {
  let cumSum = 0n
  for (let i = 0; i < dragIndex; ++i) cumSum += values[i]
  const leftPx = (Number(cumSum) / Number(totalValue)) * rect.width
  const rightPx = (Number(cumSum + values[dragIndex] + values[dragIndex + 1]) / Number(totalValue)) * rect.width

  return { leftPx, rightPx }
}

// Calculate the new values for the segments being resized
export const calculateNewSegmentValues = (
  x: number,
  leftPx: number,
  rightPx: number,
  dragIndex: number,
  values: bigint[],
  minSegmentValue: bigint = 0n,
) => {
  const pairSum = values[dragIndex] + values[dragIndex + 1]
  const totalPairPx = rightPx - leftPx
  const minLeftPx = pairSum > 0n ? (Number(minSegmentValue) / Number(pairSum)) * totalPairPx : 0
  const maxLeftPx = totalPairPx - minLeftPx
  // Calculate the handle's x relative to leftPx
  let relX = clamp(x - leftPx, minLeftPx, maxLeftPx)
  // Convert back to actual value
  let leftValue = BigInt(Math.round((relX / totalPairPx) * Number(pairSum)))
  let rightValue = pairSum - leftValue

  // Ensure minimum segment sizes
  if (leftValue < minSegmentValue) {
    leftValue = minSegmentValue
    rightValue = pairSum - leftValue
  } else if (rightValue < minSegmentValue) {
    rightValue = minSegmentValue
    leftValue = pairSum - rightValue
  }
  
  return { leftValue, rightValue }
}

// Convert actual value to percentage for display
export const valueToPercentage = (value: bigint, totalValue: bigint): number => {
  return totalValue > 0n && value > 0n ? (Number(value) / Number(totalValue)) * 100 : 0
}

// Calculate minimum segment value based on total value and minimum percentage
export const calculateMinSegmentValue = (totalValue: bigint, minPercentage: bigint = 0n): bigint => {
  return (minPercentage / 100n) * totalValue
}

