import { useExitOnOutsideClick } from '@/app/backing/hooks/useExitOnOutsideClick'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { GetPricesResult } from '@/app/user/types'
import { CommonComponentProps } from '@/components/commonProps'
import { InputNumber } from '@/components/Input/InputNumber'
import { Paragraph } from '@/components/Typography'
import { RIF, STRIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { useRef, useState } from 'react'
import { NumberFormatValues } from 'react-number-format'
import { Address, formatEther, parseEther } from 'viem'
import { PendingAllocation } from '../PendingAllocation/PendingAllocation'
import { RIFToken } from '../RIFToken/RIFToken'
import { StickySlider } from '../StickySlider/StickySlider'
import { useBackingActionsContext, useBackingContext } from '@/app/shared/context/BackingContext'

interface OnchainBackingState {
  builderBacking: bigint
  cumulativeBacking: bigint
}

export interface UpdatedBackingState extends OnchainBackingState {
  cumulativeBackingReductions: bigint
}

export interface AllocationInputProps extends CommonComponentProps {
  builderAddress: Address
  allocationTxPending?: boolean
  disabled?: boolean
  prices: GetPricesResult
  onEdit?: (editing: boolean) => void
}

export const AllocationInput = ({
  builderAddress,
  allocationTxPending = false,
  disabled = false,
  prices,
  className,
  onEdit,
}: AllocationInputProps): React.ReactElement => {
  const [editing, setEditing] = useState(false)
  const [parsingError, setParsingError] = useState<Error | null>(null)

  const {
    balance: {
      onchain: onchainBalance,
      pending: pendingBalance,
    },
    backings,
    totalBacking: { pending: updatedCumulativeBacking },
  } = useBackingContext()

  const dispatchBackingAction = useBackingActionsContext()

  const {
    onchain: onchainBacking,
    pending: updatedBacking,
  } = backings[builderAddress] ?? { onchain: 0n, pending: 0n }

  const isNegativeBacking = updatedBacking < onchainBacking
  const additionalBacking = isNegativeBacking ? 0n : updatedBacking - onchainBacking

  const amountUsd = formatCurrency(getFiatAmount(additionalBacking, prices[RIF]?.price ?? 0))

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    additionalBacking > 0n && pendingBalance > 0n
      ? Number((additionalBacking * 100n) / pendingBalance)
      : 0

  const onSliderChange = (value: number[]) => {
    const [percent] = value
    const newBacking = onchainBacking + (BigInt(percent ?? 0) * pendingBalance) / 100n
    if (isNegativeBacking) {
      return
    }

    if (isValidBalanceFraction(newBacking, updatedCumulativeBacking, updatedBacking, onchainBalance)) {
      return dispatchBackingAction({
        type: 'CHANGE_BACKING',
        payload: {
          builderAddress,
          backing: newBacking,
        }
      })
    }

    dispatchBackingAction({
      type: 'CHANGE_BACKING',
      payload: {
        builderAddress,
        backing: onchainBalance - updatedCumulativeBacking + updatedBacking,
      }
    })
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

    if (!isValidBalanceFraction(parsedValue, updatedCumulativeBacking, updatedBacking, onchainBalance)) {
      return false
    }

    return true
  }

  const onInputValueChange = ({ value }: NumberFormatValues) => {
    if (!editing) return

    try {
      dispatchBackingAction({
        type: 'CHANGE_BACKING',
        payload: {
          builderAddress,
          backing: normaliseBackingValue(onchainBacking, value),
        }
      })
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
            placeholder={!disabled ? `max ${formatSymbol(pendingBalance, STRIF)}` : '0'}
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
          {allocationTxPending && (
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
        <div data-testid="allocationInputSlider">
          <StickySlider value={[sliderValue]} max={100} step={1} onValueChange={onSliderChange} />
          <Paragraph className="text-[12px] text-v3-text-60 mt-2" data-testid="allocationInputPercentage">
            {Number(sliderValue).toFixed(0)}% of available {STRIF} for backing
          </Paragraph>
        </div>
      )}
    </div>
  )
}

// A little bit of a hacky way to check that the input is equal to the on-chain backing in the integer part and if so it should be set to that to prevent accidental fractions.
function normaliseBackingValue(onchainBacking: bigint, value: string) {
  return Number(formatEther(onchainBacking)).toFixed(0) === value ? onchainBacking : parseEther(value)
}

function isValidBalanceFraction(
  parsedValue: bigint,
  updatedCumulativeBacking: bigint,
  updatedBacking: bigint,
  balance: bigint,
): boolean {
  return parsedValue + updatedCumulativeBacking - updatedBacking <= balance
}
