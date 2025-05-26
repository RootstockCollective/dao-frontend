import Image from 'next/image'
import { FC } from 'react'
import { Popover } from '@/components/Popover/Popover'

interface PendingAllocationProps {
  pendingBacking: number | string
  currentBacking: number | string
}

export const PendingAllocation: FC<PendingAllocationProps> = ({ pendingBacking, currentBacking }) => {
  const popoverContent = (
    <div className="min-w-[220px] text-black rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span>Pending</span>
        <span className="flex items-center gap-1">
          <Image src="/images/hourglass.svg" alt="Pending" width={16} height={16} />
          {pendingBacking}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Current backing</span>
        <span>{currentBacking}</span>
      </div>
    </div>
  )
  return (
    <Popover trigger="hover" position="top" background="light" content={popoverContent} size="small">
      <Image
        src="images/hourglass.svg"
        alt="Pending"
        width={16}
        height={16}
        className="flex-shrink-0 cursor-pointer"
      />
    </Popover>
  )
}
