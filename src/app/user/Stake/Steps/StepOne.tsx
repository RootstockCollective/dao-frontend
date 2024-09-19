import { StakeRIF } from '@/app/user/Stake/StakeRIF'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { formatCurrency, toFixed } from '@/lib/utils'
import { useMemo } from 'react'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const balanceToCurrency = useMemo(
    () => Number(tokenToSend.price) * Number(tokenToSend.balance),
    [tokenToSend],
  )

  const onPercentageClicked = (percentage: number) => {
    onAmountChange((Number(tokenToSend.balance) * (percentage / 100)).toString())
  }

  const shouldEnableGoNext = useMemo(() => {
    if (Number(amount) <= 0) {
      return false
    }

    return Number(amount) <= Number(tokenToSend.balance)
  }, [amount, tokenToSend.balance])

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
    />
  )
}
