import { formatCurrency } from '@/lib/utils'
import { useCanAccountUnstakeAmount } from '@/shared/hooks/useCanAccountUnstakeAmount'
import { useMemo, useCallback } from 'react'
import { StakeRIF } from '../StakeRIF'
import { useStakingContext } from '../StakingContext'
import { StepProps } from '../types'
import Big from 'big.js'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const { isCanAccountWithdrawLoading, canAccountWithdraw, backerTotalAllocation } =
    useCanAccountUnstakeAmount(amount, tokenToSend.balance)

  const balanceToCurrency = useMemo(
    () =>
      Big(tokenToSend.price || 0)
        .mul(tokenToSend.balance)
        .toString(),
    [tokenToSend],
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      if (!value || value === '.') {
        onAmountChange('0')
      } else {
        const regex = /^\d*\.?\d{0,18}$/
        if (regex.test(value)) {
          // remove leading zeros
          onAmountChange(value.replace(/^0+(?=\d)/, ''))
        }
      }
    },
    [onAmountChange],
  )

  const onPercentageClicked = useCallback(
    (percentage: number) => {
      const balance = tokenToSend.balance

      if (percentage === 100) {
        // For 100%, use exact balance
        requestAnimationFrame(() => {
          onAmountChange(balance)
        })
      } else {
        // For other percentages, calculate with precision
        const rawAmount = Big(balance).mul(percentage).div(100)
        const displayAmount = rawAmount.toString()
        onAmountChange(displayAmount)
      }
    },
    [tokenToSend.balance, onAmountChange],
  )

  const shouldEnableGoNext = useMemo(() => {
    if (!amount || Number(amount) <= 0) return false

    // Compare with precision for validation
    const rawAmount = Big(amount)
    const rawBalance = Big(tokenToSend.balance)

    if (rawAmount.gt(rawBalance)) return false
    if (actionName === 'UNSTAKE' && !canAccountWithdraw) return false

    return true
  }, [amount, tokenToSend.balance, actionName, canAccountWithdraw])

  const shouldShowCannotWithdraw = useMemo(
    () =>
      actionName === 'UNSTAKE' &&
      !isCanAccountWithdrawLoading &&
      !canAccountWithdraw &&
      (backerTotalAllocation || 0n) > 0n,
    [actionName, backerTotalAllocation, canAccountWithdraw, isCanAccountWithdrawLoading],
  )

  return (
    <StakeRIF
      amount={amount}
      onAmountChange={handleAmountChange}
      onPercentageClicked={onPercentageClicked}
      onGoNext={onGoNext}
      shouldEnableGoNext={shouldEnableGoNext}
      totalBalance={tokenToSend.balance}
      totalBalanceConverted={formatCurrency(balanceToCurrency)}
      actionName={actionName}
      shouldShowCannotWithdraw={shouldShowCannotWithdraw}
      symbol={tokenToSend.symbol}
    />
  )
}
