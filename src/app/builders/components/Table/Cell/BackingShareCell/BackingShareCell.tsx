import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import * as Progress from '@radix-ui/react-progress'
import { FC } from 'react'

export interface BackingShareCellProps {
  backingPercentage?: number
  step?: number
  className?: string
}

export const BackingShareCell: FC<BackingShareCellProps> = ({
  backingPercentage: allocationPct,
  step = 1,
  className,
}) => {
  if (allocationPct === undefined) {
    return <div className={cn('flex items-center justify-center w-full h-full gap-2', className)}></div>
  }
  // Round to the nearest step
  const displayValue = step > 0 ? Math.round((allocationPct ?? 0) / step) * step : allocationPct

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
