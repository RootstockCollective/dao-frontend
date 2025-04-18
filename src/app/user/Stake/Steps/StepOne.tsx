import Big from '@/lib/big'
import { formatCurrency } from '@/lib/utils'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import { useCallback, useMemo } from 'react'
import { parseEther, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { StakeRIF } from '../StakeRIF'
import { useStakingContext } from '../StakingContext'
import { StepProps } from '../types'

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { address } = useAccount()

  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const { data: backerTotalAllocation, isLoading: isCanAccountWithdrawLoading } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [address ?? zeroAddress],
    },
    {
      refetchInterval: 10000,
      enabled: !!address,
      initialData: 0n,
    },
  )

  const canAccountWithdraw = useMemo(() => {
    const parsedAmount = parseEther(amount) ?? 0n
    const parsedBalance = parseEther(tokenToSend.balance) ?? 0n
    const balanceThatCanBeWithdraw = parsedBalance - (backerTotalAllocation || 0n)

    return parsedAmount <= balanceThatCanBeWithdraw
  }, [amount, tokenToSend.balance, backerTotalAllocation])

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
        // For 100%, round to 18 decimal places to prevent precision issues
        const exactBalance = Big(balance).round(18, Big.roundDown).toString()
        requestAnimationFrame(() => {
          onAmountChange(exactBalance)
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
