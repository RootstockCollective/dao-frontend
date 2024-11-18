import { StakeRIF } from '@/app/user/Stake/StakeRIF'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { formatCurrency, toFixed } from '@/lib/utils'
import { useEffect, useMemo } from 'react'
import { useCanAccountUnstakeAmount } from '@/shared/hooks/useCanAccountUnstakeAmount'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const { isCanAccountWithdrawLoading, canAccountWithdraw, refetchCanAccountWithdraw } =
    useCanAccountUnstakeAmount(BigInt(amount))

  const balanceToCurrency = useMemo(
    () => Number(tokenToSend.price) * Number(tokenToSend.balance),
    [tokenToSend],
  )

  const onPercentageClicked = (percentage: number) => {
    onAmountChange((Number(tokenToSend.balance) * (percentage / 100)).toString())
  }

  const shouldShowCannotWithdraw =
    actionName === 'UNSTAKE' && !isCanAccountWithdrawLoading && !canAccountWithdraw

  const shouldEnableGoNext = useMemo(() => {
    if (Number(amount) <= 0) {
      return false
    }
    // Extra unstake validation
    if (actionName === 'UNSTAKE') {
      if (isCanAccountWithdrawLoading) {
        return false
      }
      if (shouldShowCannotWithdraw) {
        return false
      }
    }

    return Number(amount) <= Number(tokenToSend.balance)
  }, [actionName, amount, isCanAccountWithdrawLoading, shouldShowCannotWithdraw, tokenToSend.balance])

  useEffect(() => {
    // Run extra validation when UNSTAKE
    if (actionName === 'UNSTAKE') {
      refetchCanAccountWithdraw()
    }
  }, [actionName, amount, refetchCanAccountWithdraw])

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
