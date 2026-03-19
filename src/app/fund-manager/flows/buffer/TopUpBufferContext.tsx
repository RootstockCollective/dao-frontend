'use client'

import { createContext, ReactNode, useContext } from 'react'

import { RBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'

import { useAmountInput } from '../../hooks/useAmountInput'
import { SelectedToken, useTokenSelection } from '../../hooks/useTokenSelection'

interface TopUpBufferContextValue {
  amount: string
  isValidAmount: boolean
  isAmountOverBalance: boolean
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
}

const TopUpBufferContext = createContext<TopUpBufferContextValue | null>(null)

interface Props {
  children: ReactNode
}

export const TopUpBufferProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { selectedToken, setSelectedToken, balance, balanceFormatted, isNative, requiresAllowance } =
    useTokenSelection(WRBTC_ADDRESS)

  const {
    amount,
    isValidAmount,
    isAmountOverBalance,
    errorMessage,
    usdEquivalent,
    setAmount,
    handleAmountChange,
    handlePercentageClick,
  } = useAmountInput({
    balance,
    isNative,
    tokenPrice: rbtcPrice,
  })

  const value: TopUpBufferContextValue = {
    amount,
    isValidAmount,
    isAmountOverBalance,
    errorMessage,
    usdEquivalent,
    selectedToken,
    balance,
    balanceFormatted,
    isNative,
    requiresAllowance,
    setAmount,
    handleAmountChange,
    handlePercentageClick,
    setSelectedToken,
  }

  return <TopUpBufferContext.Provider value={value}>{children}</TopUpBufferContext.Provider>
}

export const useTopUpBufferContext = () => {
  const context = useContext(TopUpBufferContext)
  if (!context) {
    throw new Error('useTopUpBufferContext must be used within a TopUpBufferProvider')
  }
  return context
}
