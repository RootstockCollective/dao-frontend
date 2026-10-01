import { useCallback, useMemo, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'

import Big from '@/lib/big'
import { formatCurrencyWithLabel, handleAmountInput } from '@/lib/utils'

interface Props {
  balance: bigint
  isNative: boolean
  /** When true, balance is the user's wallet; show gas warning if they use full native balance. */
  isUserBalance?: boolean
  tokenPrice?: number
  decimals?: number
}

/**
 * Manages amount input state, validation, percentage shortcuts, and USD equivalent display.
 * Reusable across all fund-manager CTAs.
 */
export const useAmountInput = ({
  balance,
  isNative,
  isUserBalance = true,
  tokenPrice,
  decimals = 18,
}: Props) => {
  const [amount, setAmount] = useState('')

  const handleAmountChange = useCallback((value: string) => {
    setAmount(handleAmountInput(value))
  }, [])

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const balanceStr = formatUnits(balance, decimals)
      const calculatedAmount = Big(balanceStr).mul(percentage).toFixedNoTrailing(decimals, 0)
      setAmount(calculatedAmount)
    },
    [balance, decimals],
  )

  const isAmountOverBalance = useMemo(() => {
    if (!amount || amount === '0') return false
    const amountWei = parseUnits(amount, decimals)
    return amountWei > balance
  }, [amount, balance, decimals])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return 'This is more than the available balance. Please update the amount.'
    }
    if (!isUserBalance || !isNative || !amount || amount === '0') return ''
    try {
      const amountWei = parseUnits(amount, decimals)
      if (amountWei >= balance && balance > 0n) {
        return 'Using your full balance may not leave enough for gas fees, which could cause the transaction to fail.'
      }
    } catch {
      // invalid amount string
    }
    return ''
  }, [isAmountOverBalance, isUserBalance, isNative, amount, decimals, balance])

  const isValidAmount = useMemo(() => {
    if (!amount) return false
    try {
      return Big(amount).gt(0) && !isAmountOverBalance
    } catch {
      return false
    }
  }, [amount, isAmountOverBalance])

  const usdEquivalent = useMemo(() => {
    if (!amount || !tokenPrice) return ''
    try {
      return formatCurrencyWithLabel(Big(tokenPrice).mul(amount))
    } catch {
      return ''
    }
  }, [amount, tokenPrice])

  return {
    amount,
    isValidAmount,
    isAmountOverBalance,
    errorMessage,
    usdEquivalent,
    setAmount,
    handleAmountChange,
    handlePercentageClick,
  }
}
