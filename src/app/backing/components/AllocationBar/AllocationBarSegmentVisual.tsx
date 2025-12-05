import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { AllocationItem } from './types'
import { checkerboardStyle, valueToPercentage } from './utils'

interface Props {
  item: AllocationItem
  totalValue: bigint
  value?: bigint // Optional override for item.value (e.g. pendingValue during editing)
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  onClick?: () => void
}

/**
 * AllocationBarSegmentVisual
 *
 * A visual segment for allocation bars.
 * Handles width calculation, checkerboard pattern for temporary items,
 * and applies the item's display color.
 * Supports ref forwarding and children for interactive use cases.
 */
export const AllocationBarSegmentVisual = forwardRef<HTMLDivElement, Props>(
  ({ item, totalValue, value, className, style: additionalStyle, children, onClick, ...props }, ref) => {
    // Use provided value or fall back to item.value
    const actualValue = value ?? item.value

    // Calculate the percentage width based on the actual value and total value
    const percentageWidth = valueToPercentage(actualValue, totalValue)

    // For segments with very small values, ensure they have a minimum visible width
    // but only if the value is actually greater than 0
    const effectiveWidth = actualValue > 0n && percentageWidth < 0.5 ? 0.5 : percentageWidth

    const style: React.CSSProperties = {
      ...(item.isTemporary ? checkerboardStyle() : {}),
      width: `${effectiveWidth}%`,
      backgroundColor: item.displayColor,
      ...additionalStyle,
    }

    const roundedClasses = 'first:rounded-l-lg last:rounded-r-lg md:first:rounded-l-sm md:last:rounded-r-sm'

    return (
      <div
        ref={ref}
        className={cn('h-full', roundedClasses, className)}
        style={style}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    )
  },
)

AllocationBarSegmentVisual.displayName = 'AllocationBarSegmentVisual'
