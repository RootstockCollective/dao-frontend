import { FC, useState } from 'react'
import { NewPopover } from '@/components/NewPopover'
import { Span } from '@/components/Typography'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'
import { formatNumberWithCommas } from '@/lib/utils/utils'

interface PendingAllocationProps {
  pendingBacking: string
  currentBacking: string
}

export const PendingAllocation: FC<PendingAllocationProps> = ({ pendingBacking, currentBacking }) => {
  const [isOpen, setIsOpen] = useState(false)

  const popoverContent = (
    <div
      className="flex flex-row justify-between text-v3-text-0 rounded-lg gap-4"
      data-testid="pendingAllocationPopover"
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex flex-col items-start gap-1 justify-between">
        <Span variant="body-xs" bold>
          Pending
        </Span>
        <div className="flex items-center gap-1">
          <HourglassAnimatedIcon className="flex-shrink-0 cursor-pointer" color="var(--color-bg-40)" />
          <Span variant="body-l" data-testid="pendingAllocationPending">
            {formatNumberWithCommas(pendingBacking)}
          </Span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 justify-between">
        <Span variant="body-xs" bold>
          Current
        </Span>
        <Span variant="body-l" data-testid="pendingAllocationCurrent">
          {formatNumberWithCommas(currentBacking)}
        </Span>
      </div>
    </div>
  )
  return (
    <NewPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      anchor={
        <div onMouseEnter={() => setIsOpen(true)}>
          <HourglassAnimatedIcon className="flex-shrink-0 cursor-pointer" />
        </div>
      }
      content={popoverContent}
      side="top"
      align="center"
      sideOffset={4}
      alignOffset={0}
      className="bg-white"
    />
  )
}
