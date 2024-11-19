'use client'

import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { Button, ButtonProps } from '@/components/Button'
import { Input } from '@/components/Input'
import { Link } from '@/components/Link'
import { cn } from '@/lib/utils'
import { useState } from 'react'
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

type AllocationAmountProps = {
  balance: bigint
  errorMessage?: string
  onPercentageSet?: (percentage: number) => void
}

export const AllocationAmount = ({ balance, errorMessage, onPercentageSet }: AllocationAmountProps) => {
  // TODO: hint is shown only when the allocated amount exceeds the balance
  // const hint = <StakeHint />
  const hint = undefined

  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [allocatedAmount, setAllocatedAmount] = useState('0')
  const onChange = (value: string) => {
    setAllocatedAmount(value)
  }

  const onPercentageButtonClicked = (percentage: number, index: number) => {
    const percentageAmount = (BigInt(balance ?? 0n) * BigInt(percentage)) / BigInt(100)
    setAllocatedAmount(formatBalanceToHuman(percentageAmount))
    onPercentageSet?.(percentage)
    setActiveButton(index)
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
          onChange={onChange}
          value={allocatedAmount.toString()}
          errorMessage={errorMessage}
          hint={hint}
        />
      </div>
      <div className="flex items-center gap-3">
        {[10, 20, 50, 100].map((percentage, i) => (
          <PercentageButton
            key={i}
            onClick={() => onPercentageButtonClicked(percentage, i)}
            variant={i === activeButton ? 'primary' : 'secondary'}
          >
            {' '}
            {percentage}%
          </PercentageButton>
        ))}
      </div>
    </div>
  )
}
