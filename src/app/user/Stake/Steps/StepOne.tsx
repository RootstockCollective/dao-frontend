import { StakeInput } from '@/app/user/Stake/StakeInput'
import { Button } from '@/components/Button'
import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { formatCurrency, handleAmountInput } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useStakingContext } from '../StakingContext'
import { StepProps } from '../types'

export const StepOne = ({ onGoNext }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, setButtonActions } = useStakingContext()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const balanceToCurrency = formatCurrency(Big(tokenToSend.price || 0).mul(amount || 0))

  const isAmountOverBalance = useMemo(() => {
    if (!amount) return false
    const rawAmount = Big(amount)
    const rawBalance = Big(tokenToSend.balance)
    return rawAmount.gt(rawBalance)
  }, [amount, tokenToSend.balance])

  // Set button actions directly
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Continue',
        onClick: onGoNext,
        disabled: !amount || Number(amount) <= 0 || isAmountOverBalance,
        loading: false,
      },
    })
  }, [amount, isAmountOverBalance, onGoNext, setButtonActions])

  const totalBalance = useMemo(() => tokenToSend.balance || '0', [tokenToSend.balance])

  const handleAmountChange = useCallback(
    (value: string) => {
      onAmountChange(handleAmountInput(value))
    },
    [onAmountChange],
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <StakeInput
        ref={inputRef}
        onChange={handleAmountChange}
        value={amount}
        symbol={tokenToSend.symbol}
        labelText="Amount to stake"
        currencyValue={balanceToCurrency}
        errorText={
          isAmountOverBalance ? 'This is more than the available RIF balance. Please update the amount.' : ''
        }
      />

      <div className="flex items-center justify-between mx-3 mt-2">
        <div className="flex items-center gap-1">
          <TokenImage symbol="RIF" size={12} />
          <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
            RIF Balance: {totalBalance}
          </Label>
        </div>
        <Button
          variant="secondary"
          onClick={() => handleAmountChange(totalBalance)}
          className="bg-transparent border border-bg-40 px-2 py-0 w-fit"
          data-testid="maxButton"
        >
          <Span variant="body-s">Max</Span>
        </Button>
      </div>
    </>
  )
}
