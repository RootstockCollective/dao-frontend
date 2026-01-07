import Big from 'big.js'

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

export const calculateSegmentPositions = (
  dragIndex: number,
  rect: DOMRect,
  values: bigint[],
  totalValue: bigint,
  lossless?: boolean, // FIXME: remove (and the corresponding calculation) if precision is not needed
): {
  leftPx: number
  rightPx: number
} => {
  const valuesUpToDragItem = values.reduce((a, b, i) => a + (i < dragIndex ? b : 0n), 0n)

  const targetItem = values[dragIndex]
  const adjacentItem = values[dragIndex + 1]

  if (totalValue === 0n) {
    return { leftPx: 0, rightPx: 0 }
  }

  if (lossless) {
    const leftPx = Big(valuesUpToDragItem.toString()).mul(rect.width).div(totalValue.toString())
    const rightPx = Big(valuesUpToDragItem.toString())
      .add(Big(targetItem.toString()))
      .add(Big(adjacentItem.toString()))
      .mul(rect.width)
      .div(totalValue.toString())

    return { leftPx: Number(leftPx), rightPx: Number(rightPx) }
  }

  const leftPx = (Number(valuesUpToDragItem) * rect.width) / Number(totalValue)
  const rightPx =
    ((Number(valuesUpToDragItem) + Number(targetItem) + Number(adjacentItem)) * rect.width) /
    Number(totalValue)

  return { leftPx, rightPx }
}

export const calculateNewSegmentValues = (
  x: number,
  leftPx: number,
  rightPx: number,
  dragIndex: number,
  values: bigint[],
  minSegmentValue: bigint = 0n,
): {
  leftValue: bigint
  rightValue: bigint
} => {
  const targetItem = values[dragIndex]
  const adjacentItem = values[dragIndex + 1]

  const pairSum = targetItem + adjacentItem
  if (pairSum === 0n) {
    return { leftValue: 0n, rightValue: 0n }
  }
  const totalPairPx = rightPx - leftPx

  if (totalPairPx === 0) {
    return { leftValue: targetItem, rightValue: adjacentItem }
  }

  const minLeftPx = pairSum > 0n ? (Number(minSegmentValue) / Number(pairSum)) * totalPairPx : 0
  const maxLeftPx = totalPairPx - minLeftPx

  let relX = clamp(x - leftPx, minLeftPx, maxLeftPx)

  let leftValue = BigInt(Math.round((relX / totalPairPx) * Number(pairSum)))
  let rightValue = pairSum - leftValue

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
  if (totalValue === 0n || value === 0n) return 0

  const percentage = (value * 10000n) / totalValue
  return Number(percentage) / 100
}

// Calculate minimum segment value based on total value and minimum percentage
export const calculateMinSegmentValue = (totalValue: bigint, minPercentage: bigint = 0n): bigint => {
  return (minPercentage / 100n) * totalValue
}
