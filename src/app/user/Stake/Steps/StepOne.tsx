import { StakeRIF } from '@/app/user/Stake/StakeRIF'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { formatCurrency, toFixed } from '@/lib/utils'
import { useMemo } from 'react'
import { useCanAccountUnstakeAmount } from '@/shared/hooks/useCanAccountUnstakeAmount'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()
  // For now, we can only unstake stRIF - but this might change in the future... so tokenToSend.balance must be handled on each case
  const { isCanAccountWithdrawLoading, canAccountWithdraw, backerTotalAllocation } =
    useCanAccountUnstakeAmount(Number(amount).toString(), tokenToSend.balance) // Ceil'ing to avoid crashing when using decimals

  const balanceToCurrency = useMemo(
    () => Number(tokenToSend.price) * Number(tokenToSend.balance),
    [tokenToSend],
  )

  const onPercentageClicked = (percentage: number) => {
    onAmountChange((Number(tokenToSend.balance) * (percentage / 100)).toString())
  }

  const shouldShowCannotWithdraw = useMemo(
    () =>
      actionName === 'UNSTAKE' &&
      !isCanAccountWithdrawLoading &&
      !canAccountWithdraw &&
      (backerTotalAllocation || 0n) > 0n,
    [actionName, backerTotalAllocation, canAccountWithdraw, isCanAccountWithdrawLoading],
  )

  const shouldEnableGoNext = useMemo(() => {
    if (Number(amount) <= 0) {
      return false
    }
    // Extra unstake validation
    if (actionName === 'UNSTAKE') {
      // Checks if the last amount we checked is the one that is currently introduced in the Input
      if (isCanAccountWithdrawLoading) {
        return false
      }
      if (shouldShowCannotWithdraw) {
        return false
      }
    }

    return Number(amount) <= Number(tokenToSend.balance)
  }, [actionName, amount, isCanAccountWithdrawLoading, shouldShowCannotWithdraw, tokenToSend.balance])

  return (
    <StakeRIF
      amount={amount}
      onAmountChange={onAmountChange}
      onPercentageClicked={onPercentageClicked}
      onGoNext={onGoNext}
      shouldEnableGoNext={shouldEnableGoNext}
      totalBalance={toFixed(tokenToSend.balance)}
      totalBalanceConverted={balanceToCurrency ? 'USD ' + formatCurrency(balanceToCurrency) : ''}
      symbol={tokenToSend.symbol}
      actionName={actionName}
      shouldShowCannotWithdraw={shouldShowCannotWithdraw}
    />
  )
}
