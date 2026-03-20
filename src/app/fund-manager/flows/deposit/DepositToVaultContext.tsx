'use client'

import { createContext, ReactNode, useContext } from 'react'

import { RBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'

import { useAmountInput } from '../../hooks/useAmountInput'
import { SelectedToken, useTokenSelection } from '../../hooks/useTokenSelection'

interface DepositToVaultContextValue {
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

const DepositToVaultContext = createContext<DepositToVaultContextValue | null>(null)

interface Props {
  children: ReactNode
}

export const DepositToVaultProvider = ({ children }: Props) => {
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

  const value: DepositToVaultContextValue = {
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

  return <DepositToVaultContext.Provider value={value}>{children}</DepositToVaultContext.Provider>
}

export const useDepositToVaultContext = () => {
  const context = useContext(DepositToVaultContext)
  if (!context) {
    throw new Error('useDepositToVaultContext must be used within a DepositToVaultProvider')
  }
  return context
}
