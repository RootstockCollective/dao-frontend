import { JSX } from 'react'

import { cn } from '@/lib/utils'

const TRACK_CLASSES = 'h-[6px] relative flex rounded-[20px]'

interface Value {
  value: number
  color: JSX.IntrinsicElements['div']['color']
}

interface Props {
  values: Value[]
  /**
   * Draw each slice as its own rounded pill separated by a gap, rather than one continuous
   * track. Reads better when the slices are two parts of a single quantity.
   */
  segmented?: boolean
  className?: string
  /** Describes the breakdown for screen readers, e.g. "Backers 64%, Builders 36%". */
  'aria-label'?: string
}

export const ComparativeProgressBar = ({
  values,
  segmented = false,
  className,
  'aria-label': ariaLabel,
}: Props) => {
  const total = values.reduce((acc, { value }) => acc + value, 0)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(TRACK_CLASSES, segmented ? 'gap-1' : 'bg-white overflow-hidden', className)}
    >
      {values.map(({ value, color }, index) => (
        <div
          key={index}
          // A bar with nothing in it would otherwise compute a NaN width.
          style={{ width: total > 0 ? `${(value / total) * 100}%` : '0%', backgroundColor: color }}
          className={cn('h-full', segmented && 'rounded-[20px]')}
        />
      ))}
    </div>
  )
}
