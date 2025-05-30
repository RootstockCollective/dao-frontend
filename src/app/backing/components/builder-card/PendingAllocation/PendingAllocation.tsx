import Image from 'next/image'
import { FC } from 'react'
import { Popover } from '@/components/Popover/Popover'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'

interface PendingAllocationProps {
  pendingBacking: number | string
  currentBacking: number | string
}

export const PendingAllocation: FC<PendingAllocationProps> = ({ pendingBacking, currentBacking }) => {
  const popoverContent = (
    <div className="min-w-[220px] text-v3-text-0 rounded-lg p-4" data-testid="pendingAllocationPopover">
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
    <Popover trigger="hover" position="top" background="light" content={popoverContent} size="small">
      <HourglassIcon className="flex-shrink-0 cursor-pointer" size={16} />
    </Popover>
  )
}
