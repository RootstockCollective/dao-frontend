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

  const onPercentageClicked = useCallback(
    (percentage: number) => {
      const balance = tokenToSend.balance
      // Ensure precise calculation
      const preciseAmount = Number(balance) * (percentage / 100)
      const newAmount = preciseAmount.toFixed(8)

      console.log('Percentage clicked:', {
        percentage,
        balance,
        preciseAmount,
        newAmount,
      })

      // Keep working state update logic
      Promise.resolve().then(() => {
        onAmountChange(newAmount)
      })
    },
    [tokenToSend.balance, onAmountChange],
  )

  const shouldEnableGoNext = useMemo(() => {
    console.log('Validating amount:', {
      amount,
      balance: tokenToSend.balance,
      actionName,
      canAccountWithdraw,
    })

    if (!amount || Number(amount) <= 0) {
      console.log('Invalid amount')
      return false
    }

    const amountNum = Number(amount).toFixed(8)
    const balanceNum = Number(tokenToSend.balance).toFixed(8)

    if (Number(amountNum) > Number(balanceNum)) {
      console.log('Amount exceeds balance')
      return false
    }

    if (actionName === 'UNSTAKE' && !canAccountWithdraw) {
      console.log('Cannot withdraw')
      return false
    }

    console.log('Validation passed')
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
      onAmountChange={onAmountChange}
      onPercentageClicked={onPercentageClicked}
      onGoNext={onGoNext}
      shouldEnableGoNext={shouldEnableGoNext}
      totalBalance={tokenToSend.balance}
      totalBalanceConverted={formatCurrency(balanceToCurrency)}
      actionName={actionName}
      shouldShowCannotWithdraw={shouldShowCannotWithdraw}
      symbol={''}
    />
  )
}
