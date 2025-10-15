import { StakeInput } from '@/app/user/Stake/StakeInput'
import { StakingToken } from '@/app/user/Stake/types'
import { TokenImage } from '@/components/TokenImage'
import { Label } from '@/components/Typography'
import Big from '@/lib/big'
import { formatCurrency } from '@/lib/utils'
import { forwardRef, useEffect, useRef } from 'react'
import { PercentageButtons } from './PercentageButtons'

interface Props {
  amount: string
  onAmountChange: (value: string) => void
  onPercentageClick: (percentage: number) => void
  stRifToken: StakingToken
  availableToUnstake: string
  errorMessage: string
}

export const UnstakeInput = forwardRef<HTMLInputElement, Props>(
  ({ amount, onAmountChange, onPercentageClick, stRifToken, availableToUnstake, errorMessage }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const amountToCurrency = formatCurrency(Big(stRifToken.price || 0).mul(amount || 0))

    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    return (
      <>
        <StakeInput
          ref={inputRef}
          value={amount}
          onChange={onAmountChange}
          symbol="stRIF"
          labelText="Amount to unstake"
          currencyValue={amountToCurrency}
          errorText={errorMessage}
        />

        <div className="flex flex-col justify-between mx-3 mt-2 gap-2">
          <div className="flex items-center gap-1">
            <TokenImage symbol="RIF" size={12} />
            <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
              stRIF available to unstake: {availableToUnstake}
            </Label>
          </div>
          <div className="flex gap-1 self-end">
            <PercentageButtons onPercentageClick={onPercentageClick} />
          </div>
        </div>
      </>
    )
  },
)

UnstakeInput.displayName = 'UnstakeInput'
