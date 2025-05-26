import { InputNumber } from '@/components/Input/InputNumber'
import { Paragraph } from '@/components/TypographyNew'
import { StickySlider } from '../StickySlider/StickySlider'
import { TokenImage } from '@/components/TokenImage'
import { RIF } from '@/lib/constants'
import { PendingAllocation } from '../PendingAllocation/PendingAllocation'
import { FC, useState, useEffect } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import { parseEther } from 'viem'
import { getFiatAmount } from '@/app/collective-rewards/rewards'
import { cn } from '@/lib/utils'

interface AllocationInputProps {
  allocation: number
  currentAllocation: number
  maxAllocation: number
  allocationTxPending?: boolean
  onAllocationChange: (value: number) => void
  className?: string
}

export const AllocationInput: FC<AllocationInputProps> = ({
  allocation,
  currentAllocation,
  maxAllocation,
  allocationTxPending = false,
  onAllocationChange,
  className,
}) => {
  const { prices } = usePricesContext()
  const [editing, setEditing] = useState(false)

  const allocationPercentage = maxAllocation === 0 ? 0 : (allocation / maxAllocation) * 100

  const tokenPrice = prices[RIF]?.price ?? 0
  const amountUsd = Number(getFiatAmount(parseEther(allocation.toString()), tokenPrice).toFixed(2))

  const handleSliderChange = (value: number[]) => {
    const percent = value[0]
    const newAllocation = Math.round((percent / 100) * maxAllocation)
    onAllocationChange(newAllocation)
  }

  const rifToken = (
    <div className="flex items-center gap-1 flex-shrink-0">
      <TokenImage symbol={RIF} size={16} />
      <div className="text-[14px] text-white">stRIF</div>
    </div>
  )

  return (
    <div className={cn('bg-[#25211E] border border-[#393532] rounded-lg p-3', className)}>
      <div className="flex items-center justify-between w-full">
        <div className="flex-grow min-w-0">
          <InputNumber
            name="allocation"
            placeholder={`max ${maxAllocation}`}
            className="focus:outline-none focus-visible:outline-none text-left p-0 m-0 border-0 bg-transparent w-full text-[24px]"
            value={allocation ? allocation.toString() : ''}
            max={maxAllocation}
            onValueChange={({ value }) => onAllocationChange(Number(value))}
            onFocus={() => !editing && setEditing(true)}
            disabled={allocationTxPending}
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {allocationTxPending && (
            <PendingAllocation pendingBacking={allocation} currentBacking={currentAllocation} />
          )}
          {rifToken}
        </div>
      </div>
      <Paragraph className="text-[14px] text-[#B0B0B0]">{amountUsd} USD</Paragraph>
      {editing && !allocationTxPending && (
        <div>
          <StickySlider value={[allocationPercentage]} onValueChange={handleSliderChange} />
          <Paragraph className="text-[12px] text-[#B0B0B0] mt-2">
            {allocationPercentage.toFixed(2)}% of total backing power
          </Paragraph>
        </div>
      )}
    </div>
  )
}
