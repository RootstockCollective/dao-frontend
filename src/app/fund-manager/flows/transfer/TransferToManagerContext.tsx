'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { Address, formatEther, isAddress } from 'viem'

import { RBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'

import { useAmountInput } from '../../hooks/useAmountInput'
import { useRbtcVault } from '../../hooks/useRbtcVault'
import { useTokenSelection } from '../../hooks/useTokenSelection'
import { AmountFlowContextValue } from '../createAmountFlowContext'

export interface TransferToManagerContextValue extends AmountFlowContextValue {
  recipientAddress: string
  isValidAddress: boolean
  isFormValid: boolean
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

  const { selectedToken, setSelectedToken, isNative, requiresAllowance } = useTokenSelection(WRBTC_ADDRESS)
  const { freeOnchainLiquidity: balance } = useRbtcVault()
  const balanceFormatted = useMemo(() => formatEther(balance), [balance])

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
