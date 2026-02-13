import { useExitOnOutsideClick } from '@/app/backing/hooks/useExitOnOutsideClick'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { GetPricesResult } from '@/app/user/types'
import { CommonComponentProps } from '@/components/commonProps'
import { InputNumber } from '@/components/Input/InputNumber'
import { Paragraph } from '@/components/Typography'
import { RIF, STRIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { useRef, useState, useEffect } from 'react'
import { NumberFormatValues } from 'react-number-format'
import { Address, formatEther, parseEther } from 'viem'
import { PendingAllocation } from '../PendingAllocation/PendingAllocation'
import { RIFToken } from '../RIFToken/RIFToken'
import { StickySlider } from '../StickySlider/StickySlider'

interface OnchainBackingState {
  builderBacking: bigint
  cumulativeBacking: bigint
}

export interface UpdatedBackingState extends OnchainBackingState {
  cumulativeBackingReductions: bigint
}

export interface AllocationInputProps extends CommonComponentProps {
  builderAddress: Address
  balance: bigint
  onchainBackingState: OnchainBackingState
  updatedBackingState: UpdatedBackingState
  prices: GetPricesResult
  updateBacking: (value: bigint) => void
  allocationTxPending?: boolean
  disabled?: boolean
  onEdit?: (editing: boolean) => void
}

export const AllocationInput = ({
  builderAddress,
  balance,
  onchainBackingState: { builderBacking: onchainBacking, cumulativeBacking: onchainCumulativeBacking },
  updatedBackingState: {
    builderBacking: updatedBacking,
    cumulativeBacking: updatedCumulativeBacking,
    cumulativeBackingReductions: updatedBackingReductions,
  },
  updateBacking,
  allocationTxPending = false,
  disabled = false,
  prices,
  className,
  onEdit,
}: AllocationInputProps): React.ReactElement => {
  const [editing, setEditing] = useState(false)
  const [parsingError, setParsingError] = useState<Error | null>(null)

  const onchainAvailableBalance = balance - onchainCumulativeBacking

  const totalAvailableBalance = onchainAvailableBalance + updatedBackingReductions

  const availableForBacking = balance - updatedCumulativeBacking

  const isNegativeBacking = updatedBacking < onchainBacking
  const additionalBacking = isNegativeBacking ? 0n : updatedBacking - onchainBacking

  const amountUsd = formatCurrency(getFiatAmount(additionalBacking, prices[RIF]?.price ?? 0))

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Prevent scroll when interacting with slider on mobile
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    slider.addEventListener('touchstart', handleTouchStart, { passive: false })

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  useExitOnOutsideClick({
    containerRef,
    condition: !!editing && builderAddress && updatedBacking <= onchainBacking,
    onExit: () => {
      setEditing(false)
      onEdit?.(false)
      inputRef.current?.blur()
    },
  })
  const sliderValue =
    additionalBacking > 0n && totalAvailableBalance > 0n
      ? Number((additionalBacking * 100n) / totalAvailableBalance)
      : 0

  const onSliderChange = (value: number[]) => {
    const [percent] = value
    const newBacking = onchainBacking + (BigInt(percent ?? 0) * totalAvailableBalance) / 100n
    if (isNegativeBacking) {
      return
    }

    if (isValidBalanceFraction(newBacking, updatedCumulativeBacking, updatedBacking, balance)) {
      return updateBacking(newBacking)
    }

    updateBacking(balance - updatedCumulativeBacking + updatedBacking)
  }

  const isAllowed = ({ value }: NumberFormatValues) => {
    if (!editing) return false

    let parsedValue = 0n
    try {
      parsedValue = parseEther(value)
    } catch (error) {
      setParsingError(error as Error)
      return false
    }

    if (!isValidBalanceFraction(parsedValue, updatedCumulativeBacking, updatedBacking, balance)) {
      return false
    }

    return true
  }

  const onInputValueChange = ({ value }: NumberFormatValues) => {
    if (!editing) return

    try {
      updateBacking(preventLeftoverDecimals(onchainBacking, value))
    } catch (error) {
      setParsingError(error as Error)
    }
  }
  useHandleErrors({
    error: parsingError,
    title: 'Error parsing value',
  })

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
            placeholder={!disabled ? `max ${formatSymbol(availableForBacking, STRIF)}` : '0'}
            className="focus:outline-none focus-visible:outline-none text-left p-0 m-0 border-0 bg-transparent w-full text-[24px]"
            value={updatedBacking > 0n ? formatSymbol(updatedBacking, STRIF) : ''}
            onValueChange={onInputValueChange}
            isAllowed={isAllowed}
            onFocus={() => {
              setEditing(true)
              onEdit?.(true)
            }}
            disabled={disabled}
            data-testid="allocationInputNumber"
            ref={inputRef}
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" data-testid="allocationInputActions">
          {allocationTxPending && updatedBacking !== onchainBacking && (
            <PendingAllocation
              pendingBacking={formatSymbol(updatedBacking, STRIF)}
              currentBacking={formatSymbol(onchainBacking, STRIF)}
            />
          )}
          <RIFToken />
        </div>
      </div>
      {!isNegativeBacking && (
        <Paragraph className="text-[14px] text-v3-text-60" data-testid="allocationInputUsd">
          {amountUsd}
        </Paragraph>
      )}
      {editing && !isNegativeBacking && !allocationTxPending && (
        <div ref={sliderRef} data-testid="allocationInputSlider">
          <StickySlider value={[sliderValue]} max={100} step={1} onValueChange={onSliderChange} />
          <Paragraph className="text-[12px] text-v3-text-60 mt-2" data-testid="allocationInputPercentage">
            {Number(sliderValue).toFixed(0)}% of available {STRIF} for backing
          </Paragraph>
        </div>
      )}
    </div>
  )
}

// A little bit of a hacky way to check that the input is equal to the on-chain backing **in the integer part**
// If it does, it should be set to the onchain value.
// The purpose of this is to prevent leftover fractions in the available balance, which cannot be used up.
//
// IMPORTANT: Should the sysmtem ever support fractional STRIF, this function should be removed,
// as it will not be needed since the UI will have to adapt to that change, too.
function preventLeftoverDecimals(onchainBacking: bigint, value: string): bigint {
  const onchainBackingStr = formatEther(onchainBacking)
  const [onchainBackingIntegerValue] = onchainBackingStr.split('.')

  if (onchainBackingIntegerValue === value) {
    return onchainBacking
  }

  return parseEther(value)
}

function isValidBalanceFraction(
  parsedValue: bigint,
  updatedCumulativeBacking: bigint,
  updatedBacking: bigint,
  balance: bigint,
): boolean {
  return parsedValue + updatedCumulativeBacking - updatedBacking <= balance
}
