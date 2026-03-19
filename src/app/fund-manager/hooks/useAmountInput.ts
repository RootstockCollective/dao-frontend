import { useCallback, useMemo, useState } from 'react'
import { formatEther, formatUnits, parseUnits } from 'viem'

import Big from '@/lib/big'
import { formatCurrencyWithLabel, handleAmountInput } from '@/lib/utils'

// TODO: move to constants
/** Conservative gas reserve for native rBTC transactions (0.001 rBTC) */
const GAS_RESERVE_WEI = 1_000_000_000_000_000n

interface Props {
  balance: bigint
  isNative: boolean
  tokenPrice?: number
  decimals?: number
}

/**
 * Manages amount input state, validation, percentage shortcuts (with gas reserve for native tokens),
 * and USD equivalent display. Reusable across all fund-manager CTAs.
 */
export const useAmountInput = ({ balance, isNative, tokenPrice, decimals = 18 }: Props) => {
  const [amount, setAmount] = useState('')

  const handleAmountChange = useCallback((value: string) => {
    setAmount(handleAmountInput(value))
  }, [])

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      if (percentage === 1 && isNative) {
        const maxWei = balance > GAS_RESERVE_WEI ? balance - GAS_RESERVE_WEI : 0n
        const maxStr = formatEther(maxWei)
        setAmount(maxStr)
      } else {
        const balanceStr = formatUnits(balance, decimals)
        const calculatedAmount = Big(balanceStr).mul(percentage).toString()
        setAmount(calculatedAmount)
      }
    },
    [balance, isNative, decimals],
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
    return ''
  }, [isAmountOverBalance])

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
