import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { CommonComponentProps } from '@/components/commonProps'
import { InputNumber } from '@/components/Input/InputNumber'
import { Paragraph } from '@/components/TypographyNew'
import { RIF, USD } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { AnimatePresence, motion } from 'motion/react'
import { FC, useContext, useEffect, useState } from 'react'
import { NumberFormatValues } from 'react-number-format'
import { Address, formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { CurrentBacking } from '../CurrentBacking/CurrentBacking'
import { PendingAllocation } from '../PendingAllocation/PendingAllocation'
import { RIFToken } from '../RIFToken/RIFToken'
import { StickySlider } from '../StickySlider/StickySlider'

interface AllocationInputProps extends CommonComponentProps {
  builderAddress: Address
  disabled?: boolean
  allocationTxPending?: boolean
}

export const AllocationInput: FC<AllocationInputProps> = ({
  builderAddress,
  disabled = false,
  allocationTxPending = false,
  className,
}) => {
  const {
    actions: { updateAllocation },
    state: {
      backer: { amountToAllocate, balance, cumulativeAllocation },
      allocations,
    },
    initialState: {
      allocations: initialAllocations,
      backer: { balance: totalBalance },
    },
  } = useContext(AllocationsContext)
  const { prices } = usePricesContext()
  const { isConnected } = useAccount()
  const [editing, setEditing] = useState(false)

  const allocation = allocations[builderAddress] ?? 0n
  const initialAllocation = initialAllocations[builderAddress] ?? 0n

  useEffect(() => {
    setEditing(allocation !== initialAllocation && isConnected)
  }, [allocation, initialAllocation, isConnected])

  const availableForBacking = balance - amountToAllocate

  const newValue = allocation - initialAllocation

  const amountUsd = formatCurrency(getFiatAmount(newValue, prices[RIF]?.price ?? 0), {
    currency: USD,
    showCurrency: true,
  })

  const sliderValue =
    allocation > 0n && availableForBacking > 0n ? Number((newValue * 100n) / availableForBacking) : 0

  const handleSliderChange = (value: number[]) => {
    const [percent] = value
    const newAllocation = initialAllocation + (BigInt(percent) * availableForBacking) / 100n
    if (verifyNewAllocation(newAllocation)) {
      updateAllocation(builderAddress, newAllocation)
    }
  }

  const onMouseLeave = () => {
    if (allocation === initialAllocation) {
      setEditing(false)
    }
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
    if (parsedValue > availableForBacking) {
      return false
    }
    return true
  }

  const onValueChange = ({ value }: NumberFormatValues) => {
    const newAllocation = (parseEther(value) ?? 0n) + initialAllocation
    if (verifyNewAllocation(newAllocation)) {
      updateAllocation(builderAddress, newAllocation)
    }
  }

  const verifyNewAllocation = (newAllocation: bigint) => {
    return true
    console.warn(
      '😈 ~ AllocationInput.tsx ~ verifyNewAllocation ~ newAllocation + cumulativeAllocation:',
      formatEther(newAllocation + cumulativeAllocation),
    )
    console.warn('😈 ~ AllocationInput.tsx ~ verifyNewAllocation ~ balance:', formatEther(totalBalance))
    return newAllocation + cumulativeAllocation < totalBalance
  }

  return (
    <div
      className={cn(
        'bg-v3-bg-accent-80 border border-v3-bg-accent-60 rounded-lg font-rootstock-sans',
        disabled && 'bg-v3-bg-accent-60',
        className,
      )}
      data-testid="allocationInputContainer"
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center justify-between w-full" data-testid="allocationInputContent">
        <div className="flex-grow min-w-0" data-testid="allocationInputValue">
          <InputNumber
            name="allocation"
            autoComplete="off"
            decimalScale={0}
            placeholder={!disabled ? `max ${formatSymbol(availableForBacking, 'stRIF')}` : '0'}
            className="focus:outline-none focus-visible:outline-none text-left p-0 m-0 border-0 bg-transparent w-full text-[24px]"
            value={newValue ? formatSymbol(newValue, 'stRIF') : ''}
            onValueChange={onValueChange}
            isAllowed={isAllowed}
            onFocus={() => setEditing(true)}
            disabled={disabled}
            data-testid="allocationInputNumber"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" data-testid="allocationInputActions">
          {allocationTxPending && (
            <PendingAllocation
              pendingBacking={formatSymbol(allocation, 'stRIF')}
              currentBacking={formatSymbol(initialAllocation, 'stRIF')}
            />
          )}
          <RIFToken />
        </div>
      </div>
      {newValue > 0n && (
        <Paragraph className="text-[14px] text-v3-text-60" data-testid="allocationInputUsd">
          {amountUsd}
        </Paragraph>
      )}
      {editing && !allocationTxPending && (
        <div data-testid="allocationInputSlider">
          <StickySlider value={[sliderValue]} max={100} step={1} onValueChange={handleSliderChange} />
          <Paragraph className="text-[12px] text-v3-text-60 mt-2" data-testid="allocationInputPercentage">
            {Number(sliderValue).toFixed(0)}% of available stRIF for backing
          </Paragraph>
        </div>
      )}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CurrentBacking existentAllocation={initialAllocation} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
