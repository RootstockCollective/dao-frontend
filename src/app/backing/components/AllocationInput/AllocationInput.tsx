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
  console.warn('😈 ~ AllocationInput.tsx ~ AllocationInput ~ builderAddress:', builderAddress)
  const {
    actions: { updateAllocation },
    state: {
      backer: { balance, cumulativeAllocation: contextCumulativeAllocation },
      allocations,
    },
    initialState: {
      allocations: initialAllocations,
      backer: { amountToAllocate: totalOnchainAllocation },
    },
  } = useContext(AllocationsContext)
  const { prices } = usePricesContext()
  const { isConnected } = useAccount()
  const [editing, setEditing] = useState(false)

  const onchainAvailableBalance = balance - totalOnchainAllocation

  console.warn(
    `😈 ~ AllocationInput ~ onchainAvailableBalance: ${onchainAvailableBalance} = \nbalance ${balance} - totalOnchainAllocation ${totalOnchainAllocation}`,
  )

  const reducedAllocations = Object.entries(allocations).reduce((acc, [address, allocation]) => {
    const onchainAllocation = initialAllocations[address as Address] ?? 0n
    if (onchainAllocation > allocation) {
      acc += onchainAllocation - allocation
    }

    return acc
  }, 0n)
  const totalAvailableBalance = onchainAvailableBalance + reducedAllocations
  console.warn(
    `😈 ~ AllocationInput ~ totalAvailableBalance: ${totalAvailableBalance} = \nonchainAvailableBalance ${onchainAvailableBalance} + reducedAllocations ${reducedAllocations}`,
  )

  const cumulativeAllocation = Object.values(allocations).reduce(
    (acc, allocation) => (acc + allocation) as bigint,
    0n,
  )
  const availableForBacking = balance - cumulativeAllocation
  console.warn(
    `😈 ~ AllocationInput ~ availableForBacking: ${availableForBacking} = \nbalance ${balance} - cumulativeAllocation ${cumulativeAllocation} (${
      contextCumulativeAllocation === cumulativeAllocation ? 'equal' : 'different'
    } to context)`,
  )

  const updatedBacking = allocations[builderAddress] ?? 0n
  const currentBacking = initialAllocations[builderAddress] ?? 0n
  const additionalBacking = updatedBacking - currentBacking
  console.warn(
    `😈 ~ AllocationInput ~ additionalBacking: ${additionalBacking} = \nupdatedBacking ${updatedBacking} - currentBacking ${currentBacking}`,
  )

  useEffect(() => {
    setEditing(updatedBacking !== currentBacking && isConnected)
  }, [updatedBacking, currentBacking, isConnected])

  const amountUsd = formatCurrency(getFiatAmount(additionalBacking, prices[RIF]?.price ?? 0), {
    currency: USD,
    showCurrency: true,
  })

  const sliderValue =
    additionalBacking > 0n && totalAvailableBalance > 0n
      ? Number((additionalBacking * 100n) / totalAvailableBalance)
      : 0

  const handleSliderChange = (value: number[]) => {
    const [percent] = value
    const newBacking = currentBacking + (BigInt(percent) * totalAvailableBalance) / 100n
    if (verifyNewBacking(newBacking)) {
      updateAllocation(builderAddress, newBacking)
    }
  }

  const onMouseLeave = () => {
    if (updatedBacking === currentBacking) {
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
    const newBacking = (parseEther(value) ?? 0n) + currentBacking
    if (verifyNewBacking(newBacking)) {
      updateAllocation(builderAddress, newBacking)
    }
  }

  const verifyNewBacking = (newBacking: bigint) => {
    return true // FIXME: @jurajpiar implement
    console.warn(
      '😈 ~ AllocationInput.tsx ~ verifyNewAllocation ~ newAllocation + cumulativeAllocation:',
      formatEther(newBacking + cumulativeAllocation),
    )
    console.warn('😈 ~ AllocationInput.tsx ~ verifyNewAllocation ~ balance:', formatEther(balance))
    return newBacking + cumulativeAllocation < balance
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
            value={additionalBacking ? formatSymbol(additionalBacking, 'stRIF') : ''}
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
              pendingBacking={formatSymbol(updatedBacking, 'stRIF')}
              currentBacking={formatSymbol(currentBacking, 'stRIF')}
            />
          )}
          <RIFToken />
        </div>
      </div>
      {additionalBacking > 0n && (
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
            <CurrentBacking existentAllocation={currentBacking} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
