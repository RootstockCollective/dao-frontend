'use client'

import { createContext, ReactNode, useContext } from 'react'

import { RBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'

import { useAmountInput } from '../hooks/useAmountInput'
import { SelectedToken, useTokenSelection } from '../hooks/useTokenSelection'

export interface AmountFlowContextValue {
  amount: string
  isValidAmount: boolean
  isAmountOverBalance: boolean
  /** True when amount exceeds optional on-chain limit (e.g. reportedOffchainAssets for deposit). */
  isAmountOverLimit: boolean
  errorMessage: string
  usdEquivalent: string
  selectedToken: SelectedToken
  balance: bigint
  balanceFormatted: string
  isNative: boolean
  requiresAllowance: boolean
  setAmount: (value: string) => void
  handleAmountChange: (value: string) => void
  handlePercentageClick: (percentage: number) => void
  setSelectedToken: (token: SelectedToken) => void
  /** Reported off-chain assets display (moveCapitalIn cap) when applicable. */
  limitInfo?: { amount: string; fiatAmount?: string }
  /** Formatted max depositable amount (min of wallet balance and reported off-chain cap) for deposit flows. */
  maxDepositableFormatted?: string
  /** Deposit-to-vault: reported off-chain cap read state (for limit row / retry). */
  depositLimitStatus?: 'loading' | 'error' | 'ready'
  /** Deposit-to-vault: refetch vault reads after a batch error. */
  onRetryDepositLimit?: () => void | Promise<void>
}

export const createAmountFlowContext = (displayName: string) => {
  const Context = createContext<AmountFlowContextValue | null>(null)

  const Provider = ({ children }: { children: ReactNode }) => {
    const { prices } = usePricesContext()
    const rbtcPrice = prices[RBTC]?.price ?? 0

    const tokenSelection = useTokenSelection(WRBTC_ADDRESS)

    const amountInput = useAmountInput({
      balance: tokenSelection.balance,
      isNative: tokenSelection.isNative,
      tokenPrice: rbtcPrice,
    })

    const value: AmountFlowContextValue = {
      amount: amountInput.amount,
      isValidAmount: amountInput.isValidAmount,
      isAmountOverBalance: amountInput.isAmountOverBalance,
      isAmountOverLimit: false,
      errorMessage: amountInput.errorMessage,
      usdEquivalent: amountInput.usdEquivalent,
      selectedToken: tokenSelection.selectedToken,
      balance: tokenSelection.balance,
      balanceFormatted: tokenSelection.balanceFormatted,
      isNative: tokenSelection.isNative,
      requiresAllowance: tokenSelection.requiresAllowance,
      setAmount: amountInput.setAmount,
      handleAmountChange: amountInput.handleAmountChange,
      handlePercentageClick: amountInput.handlePercentageClick,
      setSelectedToken: tokenSelection.setSelectedToken,
    }

    return <Context.Provider value={value}>{children}</Context.Provider>
  }
  Provider.displayName = `${displayName}Provider`

  const useFlowContext = () => {
    const context = useContext(Context)
    if (!context) {
      throw new Error(`use${displayName}Context must be used within a ${displayName}Provider`)
    }
    return context
  }

  return { Provider, useFlowContext }
}
