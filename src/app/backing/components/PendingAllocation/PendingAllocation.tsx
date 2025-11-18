import { FC, useState } from 'react'
import { NewPopover } from '@/components/NewPopover'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { Span } from '@/components/Typography'

interface PendingAllocationProps {
  pendingBacking: string
  currentBacking: string
}

export const PendingAllocation: FC<PendingAllocationProps> = ({ pendingBacking, currentBacking }) => {
  const [isOpen, setIsOpen] = useState(false)

  const popoverContent = (
    <div
      className="min-w-[220px] text-v3-text-0 rounded-lg p-4"
      data-testid="pendingAllocationPopover"
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex justify-between items-center mb-2">
        <Span variant="body-s">Pending</Span>
        <Span variant="body-s" className="flex items-center gap-1">
          <HourglassIcon className="flex-shrink-0 cursor-pointer" size={16} />
          <Span variant="body-s" data-testid="pendingAllocationPending">
            {pendingBacking}
          </Span>
        </Span>
      </div>
      <div className="flex justify-between items-center">
        <Span variant="body-s">Current backing</Span>
        <Span variant="body-s" data-testid="pendingAllocationCurrent">
          {currentBacking}
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
          <HourglassIcon className="flex-shrink-0 cursor-pointer" size={16} />
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
