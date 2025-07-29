import { getFiatAmount } from '@/app/collective-rewards/rewards'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { InputNumber } from '@/components/Input/InputNumber'
import { Paragraph } from '@/components/TypographyNew'
import { USD } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { Dispatch, FC, SetStateAction, useRef, useEffect } from 'react'
import { NumberFormatValues } from 'react-number-format'
import { parseEther } from 'viem'
import { PendingAllocation } from '../PendingAllocation/PendingAllocation'
import { RIFToken } from '../RIFToken/RIFToken'
import { StickySlider } from '../StickySlider/StickySlider'

interface AllocationInputProps {
  allocation: bigint
  existentAllocation: bigint
  maxAllocation: bigint
  rifPriceUsd: number
  disabled?: boolean
  allocationTxPending?: boolean
  onAllocationChange: (value: bigint) => void
  className?: string
  editing?: boolean
  setEditing?: Dispatch<SetStateAction<boolean>>
}

export const AllocationInput: FC<AllocationInputProps> = ({
  allocation,
  existentAllocation,
  maxAllocation,
  rifPriceUsd,
  disabled = false,
  allocationTxPending = false,
  onAllocationChange,
  className,
  editing,
  setEditing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const allocationPercentage = maxAllocation === 0n ? 0 : Number((allocation * 100n) / maxAllocation)
  const amountUsd = formatCurrency(getFiatAmount(allocation, rifPriceUsd), {
    currency: USD,
    showCurrency: true,
  })

  // Handle click outside to collapse if allocation hasn't changed
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        allocation === existentAllocation
      ) {
        setEditing?.(false)
      }
    }

    if (editing) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editing, allocation, existentAllocation, setEditing])

  const handleSliderChange = (value: number[]) => {
    const percent = value[0]
    // Scale percent to avoid floating point math
    const scaledPercent = (BigInt(percent) * BigInt(10 ** 18)) / BigInt(100)
    // maxAllocation is already a bigint (e.g., in wei)
    const newAllocation = (maxAllocation * scaledPercent) / BigInt(10 ** 18)
    onAllocationChange(newAllocation)
  }

  const isAllowed = ({ value }: NumberFormatValues) => {
    if (!editing) return false
    let parsedValue = 0n
    try {
      parsedValue = parseEther(value)
    } catch (error) {
      console.error('### Error parsing value', error)
      return false
    }
    if (parsedValue > maxAllocation) {
      return false
    }
    return true
  }

  const onValueChange = ({ value }: NumberFormatValues) => {
    // Checks are performed in isAllowed
    onAllocationChange(parseEther(value))
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-v3-bg-accent-80 border border-v3-bg-accent-60 rounded-lg font-rootstock-sans',
        disabled && 'bg-v3-bg-accent-60',
        className,
      )}
      data-testid="allocationInputContainer"
    >
      <div className="flex items-center justify-between w-full" data-testid="allocationInputContent">
        <div className="flex-grow min-w-0" data-testid="allocationInputValue">
          <InputNumber
            name="allocation"
            autoComplete="off"
            decimalScale={0}
            placeholder={!disabled ? `max ${formatSymbol(maxAllocation, 'stRIF')}` : '0'}
            className="focus:outline-none focus-visible:outline-none text-left p-0 m-0 border-0 bg-transparent w-full text-[24px]"
            value={allocation ? formatSymbol(allocation, 'stRIF') : ''}
            onValueChange={onValueChange}
            isAllowed={isAllowed}
            onFocus={() => !editing && setEditing?.(true)}
            disabled={disabled}
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
        {amountUsd}
      </Paragraph>
      {editing && !allocationTxPending && (
        <div data-testid="allocationInputSlider">
          <StickySlider
            value={[allocationPercentage]}
            step={1}
            onValueChange={handleSliderChange}
          />
          <Paragraph className="text-[12px] text-v3-text-60 mt-2" data-testid="allocationInputPercentage">
            {allocationPercentage.toFixed(0)}% of available stRIF for backing
          </Paragraph>
        </div>
      )}
    </div>
  )
}
