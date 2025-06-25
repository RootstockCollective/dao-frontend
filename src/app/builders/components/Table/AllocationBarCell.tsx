import { Paragraph } from '@/components/TypographyNew'
import { FC } from 'react'
import * as Progress from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface AllocationBarCellProps {
  allocationPct: number
  className?: string
}

export const AllocationBarCell: FC<AllocationBarCellProps> = ({ allocationPct, className }) => {
  return (
    <div className={cn('flex items-center justify-center w-full h-full gap-2', className)}>
      <Progress.Root
        className="relative overflow-hidden bg-v3-bg-accent-20 w-[30.7%] h-[1px]"
        value={allocationPct}
      >
        <Progress.Indicator
          className="h-full bg-v3-rif-blue transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - allocationPct}%)` }}
        />
      </Progress.Root>
      <Paragraph>{allocationPct}%</Paragraph>
    </div>
  )
}
