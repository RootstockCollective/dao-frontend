'use client'

import { Allocations, AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol } from '@/app/collective-rewards/rewards'
import { Button, ButtonProps } from '@/components/Button'
import { Input } from '@/components/Input'
import { cn } from '@/lib/utils'
import { useContext, useState } from 'react'
import { Address, parseEther } from 'viem'
import { StakeHint } from './StakeHint'

const PercentageButton = ({ children, variant, ...rest }: ButtonProps) => (
  <Button
    className={cn('px-2 py-1', variant === 'primary' && 'border-[1px] border-primary')}
    variant={variant}
    {...rest}
  >
    {children}
  </Button>
)

const ALLOCATION_EXCEED_AMOUNT_ERROR = 'Builder allocations exceeds amount to allocate'

export const AllocationAmount = () => {
  const {
    state: {
      allocations,
      backer: { balance, amountToAllocate, cumulativeAllocation, allocationsCount },
    },
    actions: { updateAllocations, updateAmountToAllocate },
  } = useContext(AllocationsContext)

  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null)

  const onPercentageButtonClicked = (percentage: number, index: number) => {
    const newAmountToAllocate = (BigInt(balance ?? 0n) * BigInt(percentage)) / BigInt(100)

    updateAmountToAllocate(newAmountToAllocate)
    setActiveButtonIndex(index)
    if (allocationsCount === 0) return
    const newAllocations = Object.keys(allocations).reduce((acc, key) => {
      const builderAddress = key as Address
      const newAllocation = newAmountToAllocate / BigInt(allocationsCount)
      acc[builderAddress] = newAllocation

      return acc
    }, {} as Allocations)
    updateAllocations(newAllocations)
  }

  const handleOnChange = (value: string) => {
    updateAmountToAllocate(parseEther(value))
  }

  return (
    <div className="flex flex-col items-end gap-4 min-w-[694px] min-h-[130px]">
      <div className="flex flex-col items-center gap-[10px] self-stretch">
        <Input
          type="number"
          className="w-full"
          label="Set amount to allocate"
          labelProps={{ className: 'text-base leading-4 font-normal' }}
          name="allocated-amount"
          fullWidth
          onChange={handleOnChange}
          value={formatSymbol(amountToAllocate, 'stRIF')}
          errorMessage={
            cumulativeAllocation > amountToAllocate && cumulativeAllocation < balance
              ? ALLOCATION_EXCEED_AMOUNT_ERROR
              : ''
          }
          hint={
            Number(amountToAllocate - cumulativeAllocation) < 0 || amountToAllocate > balance ? (
              <StakeHint />
            ) : undefined
          }
        />
      </div>
      <div className="flex items-center gap-3">
        {[10, 20, 50, 100].map((percentage, i) => (
          <PercentageButton
            key={i}
            onClick={() => onPercentageButtonClicked(percentage, i)}
            variant={i === activeButtonIndex ? 'primary' : 'secondary'}
          >
            {' '}
            {percentage}%
          </PercentageButton>
        ))}
      </div>
    </div>
  )
}
