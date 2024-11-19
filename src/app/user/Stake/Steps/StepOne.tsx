import { useRef } from 'react'
import { StakeRIF } from '@/app/user/Stake/StakeRIF'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { debounce, formatCurrency, toFixed } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useCanAccountUnstakeAmount } from '@/shared/hooks/useCanAccountUnstakeAmount'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const { isCanAccountWithdrawLoading, canAccountWithdraw, refetchCanAccountWithdraw } =
    useCanAccountUnstakeAmount(BigInt(amount))
  // Tracks the most recent amount that completed validation via the withdrawal check API.
  const [lastAmountFetched, setLastAmountFetched] = useState('')

  const debounceRefetchCanAccountWithdraw = useRef(
    debounce((amountToUpdate: string) => {
      refetchCanAccountWithdraw().then(() => setLastAmountFetched(amountToUpdate))
    }, 1000),
  ).current

  const balanceToCurrency = useMemo(
    () => Number(tokenToSend.price) * Number(tokenToSend.balance),
    [tokenToSend],
  )

  const onPercentageClicked = (percentage: number) => {
    onAmountChange((Number(tokenToSend.balance) * (percentage / 100)).toString())
  }

  const shouldShowCannotWithdraw = useMemo(
    () => actionName === 'UNSTAKE' && !isCanAccountWithdrawLoading && canAccountWithdraw === false,
    [actionName, canAccountWithdraw, isCanAccountWithdrawLoading],
  )

  const shouldEnableGoNext = useMemo(() => {
    if (Number(amount) <= 0) {
      return false
    }
    // Extra unstake validation
    if (actionName === 'UNSTAKE') {
      // Checks if the last amount we checked is the one that is currently introduced in the Input
      if (lastAmountFetched !== amount) {
        return false
      }
      if (isCanAccountWithdrawLoading) {
        return false
      }
      if (shouldShowCannotWithdraw) {
        return false
      }
    }

    return Number(amount) <= Number(tokenToSend.balance)
  }, [
    actionName,
    amount,
    isCanAccountWithdrawLoading,
    lastAmountFetched,
    shouldShowCannotWithdraw,
    tokenToSend.balance,
  ])

  useEffect(() => {
    // Run extra validation when UNSTAKE
    if (actionName === 'UNSTAKE') {
      debounceRefetchCanAccountWithdraw(amount)
    }
  }, [actionName, amount, debounceRefetchCanAccountWithdraw])

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
