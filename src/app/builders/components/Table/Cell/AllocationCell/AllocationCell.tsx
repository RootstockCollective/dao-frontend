import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import * as Progress from '@radix-ui/react-progress'
import { FC } from 'react'

export interface AllocationCellProps {
  allocationPct: bigint
  step?: number
  className?: string
}

export const AllocationCell: FC<AllocationCellProps> = ({ allocationPct, step = 1, className }) => {
  const allocations = Number(allocationPct)
  // Round to the nearest step
  const displayValue = step > 0 ? Math.round(allocations / step) * step : allocations

  return (
    <div className={cn('flex items-center justify-center w-full h-full gap-2', className)}>
      <Progress.Root
        className="relative overflow-hidden bg-v3-bg-accent-20 w-full h-[0.0625rem]"
        value={displayValue}
      >
        <Progress.Indicator
          className="h-full bg-v3-rif-blue transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - displayValue}%)` }}
        />
      </Progress.Root>
      <Paragraph>{displayValue}%</Paragraph>
    </div>
  )
}
