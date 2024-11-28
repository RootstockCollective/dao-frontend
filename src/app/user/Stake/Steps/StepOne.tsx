import { formatCurrency, toFixed } from '@/lib/utils'
import { useCanAccountUnstakeAmount } from '@/shared/hooks/useCanAccountUnstakeAmount'
import { useMemo, useCallback } from 'react'
import { StakeRIF } from '../StakeRIF'
import { useStakingContext } from '../StakingContext'
import { StepProps } from '../types'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const { isCanAccountWithdrawLoading, canAccountWithdraw, backerTotalAllocation } =
    useCanAccountUnstakeAmount(Number(amount).toString(), tokenToSend.balance)

  const balanceToCurrency = useMemo(
    () => Number(tokenToSend.price) * Number(tokenToSend.balance),
    [tokenToSend],
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      if (!value || value === '.') {
        onAmountChange('0')
        return
      }

      const regex = /^\d*\.?\d{0,8}$/
      if (regex.test(value)) {
        onAmountChange(value)
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
        return
      }

      // For other percentages, calculate with precision
      const rawAmount = Number(balance) * (percentage / 100)
      const displayAmount = rawAmount.toFixed(8)
      onAmountChange(displayAmount)
    },
    [tokenToSend.balance, onAmountChange],
  )

  const shouldEnableGoNext = useMemo(() => {
    if (!amount || Number(amount) <= 0) return false

    // Compare with precision for validation
    const rawAmount = Number(amount)
    const rawBalance = Number(tokenToSend.balance)

    if (rawAmount > rawBalance) return false
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
