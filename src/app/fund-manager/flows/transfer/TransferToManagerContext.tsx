'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { Address, isAddress } from 'viem'

import { RBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'

import { useAmountInput } from '../../hooks/useAmountInput'
import { SelectedToken, useTokenSelection } from '../../hooks/useTokenSelection'

interface TransferToManagerContextValue {
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
  recipientAddress: string
  isValidAddress: boolean
  isFormValid: boolean
  setAmount: (value: string) => void
  handleAmountChange: (value: string) => void
  handlePercentageClick: (percentage: number) => void
  setSelectedToken: (token: SelectedToken) => void
  setRecipientAddress: (address: string) => void
}

const TransferToManagerContext = createContext<TransferToManagerContextValue | null>(null)

interface Props {
  children: ReactNode
}

export const TransferToManagerProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const [recipientAddress, setRecipientAddressRaw] = useState('')
  const isValidAddress = isAddress(recipientAddress as Address)

  const setRecipientAddress = useCallback((address: string) => {
    setRecipientAddressRaw(address.trim())
  }, [])

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

  const isFormValid = isValidAmount && isValidAddress

  const value: TransferToManagerContextValue = {
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
    recipientAddress,
    isValidAddress,
    isFormValid,
    setAmount,
    handleAmountChange,
    handlePercentageClick,
    setSelectedToken,
    setRecipientAddress,
  }

  return <TransferToManagerContext.Provider value={value}>{children}</TransferToManagerContext.Provider>
}

export const useTransferToManagerContext = () => {
  const context = useContext(TransferToManagerContext)
  if (!context) {
    throw new Error('useTransferToManagerContext must be used within a TransferToManagerProvider')
  }
  return context
}
