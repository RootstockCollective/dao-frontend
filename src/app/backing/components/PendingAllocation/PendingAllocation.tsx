import Image from 'next/image'
import { FC, useState } from 'react'
import { NewPopover } from '@/components/NewPopover'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'

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
        <span>Pending</span>
        <span className="flex items-center gap-1">
          <HourglassIcon className="flex-shrink-0 cursor-pointer" size={16} />
          <span data-testid="pendingAllocationPending">{pendingBacking}</span>
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Current backing</span>
        <span data-testid="pendingAllocationCurrent">{currentBacking}</span>
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
    />
  )
}
