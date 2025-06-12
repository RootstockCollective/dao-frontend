import { getFiatAmount } from '@/app/collective-rewards/rewards'
import { InputNumber } from '@/components/Input/InputNumber'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { FC, useState } from 'react'
import { formatEther } from 'viem'
import { PendingAllocation } from '../PendingAllocation/PendingAllocation'
import { StickySlider } from '../StickySlider/StickySlider'
import { RIFToken } from '../RIFToken/RIFToken'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'

interface AllocationInputProps {
  allocation: bigint
  existentAllocation: bigint
  maxAllocation: bigint
  rifPriceUsd: number
  allocationTxPending?: boolean
  onAllocationChange: (value: number) => void
  className?: string
}

export const AllocationInput: FC<AllocationInputProps> = ({
  allocation,
  existentAllocation,
  maxAllocation,
  rifPriceUsd,
  allocationTxPending = false,
  onAllocationChange,
  className,
}) => {
  const [editing, setEditing] = useState(false)

  const allocationPercentage = maxAllocation === 0n ? 0 : Number((allocation * 100n) / maxAllocation)
  const amountUsd = Number(getFiatAmount(allocation, rifPriceUsd).toFixed(2))

  const handleSliderChange = (value: number[]) => {
    const percent = value[0]
    const newAllocation = Math.round((percent / 100) * Number(formatEther(maxAllocation)))
    onAllocationChange(newAllocation)
  }

  return (
    <div
      className={cn(
        'bg-v3-bg-accent-80 border border-v3-bg-accent-60 rounded-lg p-3 font-rootstock-sans',
        className,
      )}
      data-testid="allocationInputContainer"
    >
      <div className="flex items-center justify-between w-full" data-testid="allocationInputContent">
        <div className="flex-grow min-w-0" data-testid="allocationInputValue">
          <InputNumber
            name="allocation"
            autoComplete="off"
            placeholder={`max ${formatSymbol(maxAllocation, 'stRIF')}`}
            className="focus:outline-none focus-visible:outline-none text-left p-0 m-0 border-0 bg-transparent w-full text-[24px]"
            value={allocation ? formatSymbol(allocation, 'stRIF') : ''}
            max={Number(formatEther(maxAllocation))}
            onValueChange={({ value }) => onAllocationChange(Number(value))}
            onFocus={() => !editing && setEditing(true)}
            disabled={allocationTxPending}
            data-testid="allocationInputNumber"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" data-testid="allocationInputActions">
          {allocationTxPending && (
            <PendingAllocation
              pendingBacking={formatSymbol(allocation, 'stRIF')}
              currentBacking={formatSymbol(existentAllocation, 'stRIF')}
            />
          )}
          <RIFToken />
        </div>
      </div>
      <Paragraph className="text-[14px] text-v3-text-60" data-testid="allocationInputUsd">
        {amountUsd} USD
      </Paragraph>
      {editing && !allocationTxPending && (
        <div data-testid="allocationInputSlider">
          <StickySlider value={[allocationPercentage]} step={1} onValueChange={handleSliderChange} />
          <Paragraph className="text-[12px] text-v3-text-60 mt-2" data-testid="allocationInputPercentage">
            {allocationPercentage.toFixed(0)}% of total backing power
          </Paragraph>
        </div>
      )}
    </div>
  )
}
