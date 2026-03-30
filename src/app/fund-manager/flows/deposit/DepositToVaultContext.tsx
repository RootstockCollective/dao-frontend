'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'

import { formatMetrics, formatSymbol } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { RBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'

import { useAmountInput } from '../../hooks/useAmountInput'
import { useRbtcVault } from '../../hooks/useRbtcVault'
import { useTokenSelection } from '../../hooks/useTokenSelection'
import { AmountFlowContextValue } from '../createAmountFlowContext'
import {
  effectiveDepositMaxWei,
  isAmountOverReportedOffchain,
  moveCapitalInBlockingError,
} from './moveCapitalInAmountValidation'

const DepositToVaultContext = createContext<AmountFlowContextValue | null>(null)

interface Props {
  children: ReactNode
}

export const DepositToVaultProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { reportedOffchainAssets, isBatchLoading, vaultBatchError, refetchVault } = useRbtcVault()

  const capKnown = !isBatchLoading && !vaultBatchError
  const depositLimitStatus = capKnown ? 'ready' : vaultBatchError ? 'error' : 'loading'
  const reportedOffchainCap = capKnown ? reportedOffchainAssets : null

  const tokenSelection = useTokenSelection(WRBTC_ADDRESS)

  const limitInfo = useMemo(() => {
    if (!capKnown) return
    return formatMetrics(reportedOffchainAssets, rbtcPrice, RBTC)
  }, [capKnown, reportedOffchainAssets, rbtcPrice])

  const effectiveMaxWei = useMemo(
    () => effectiveDepositMaxWei(tokenSelection.balance, reportedOffchainCap),
    [tokenSelection.balance, reportedOffchainCap],
  )

  const maxDepositableFormatted = useMemo(
    () => (capKnown ? formatMetrics(effectiveMaxWei, rbtcPrice, RBTC).amount : undefined),
    [capKnown, effectiveMaxWei, rbtcPrice],
  )

  const amountInput = useAmountInput({
    balance: tokenSelection.balance,
    isNative: tokenSelection.isNative,
    tokenPrice: rbtcPrice,
  })

  const { amount } = amountInput

  const moveCapitalInBlocking = useMemo(() => {
    if (!amount) return null
    try {
      const amountWei = parseUnits(amount, 18)
      const capDisplay = `${formatSymbol(reportedOffchainAssets, RBTC)} ${RBTC}`
      return moveCapitalInBlockingError(amountWei, reportedOffchainCap, capDisplay)
    } catch {
      return null
    }
  }, [amount, reportedOffchainAssets, reportedOffchainCap])

  const isAmountOverLimit = useMemo(() => {
    if (!amount) return false
    try {
      return isAmountOverReportedOffchain(parseUnits(amount, 18), reportedOffchainCap)
    } catch {
      return false
    }
  }, [amount, reportedOffchainCap])

  const errorMessage = useMemo(() => {
    if (amountInput.isAmountOverBalance) {
      return amountInput.errorMessage
    }
    if (amountInput.isValidAmount && !capKnown) {
      if (isBatchLoading) {
        return 'Loading deposit limit…'
      }
      return 'Could not load the deposit limit. Please try again.'
    }
    if (moveCapitalInBlocking) {
      return moveCapitalInBlocking
    }
    return amountInput.errorMessage
  }, [
    amountInput.isAmountOverBalance,
    amountInput.isValidAmount,
    amountInput.errorMessage,
    capKnown,
    isBatchLoading,
    moveCapitalInBlocking,
  ])

  const isValidAmount = useMemo(
    () => amountInput.isValidAmount && capKnown && !moveCapitalInBlocking,
    [amountInput.isValidAmount, capKnown, moveCapitalInBlocking],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const baseStr = formatUnits(effectiveMaxWei, 18)
      const calculatedAmount = Big(baseStr).mul(percentage).toFixedNoTrailing(18, 0)
      amountInput.setAmount(calculatedAmount)
    },
    [effectiveMaxWei, amountInput.setAmount],
  )

  const value: AmountFlowContextValue = {
    amount: amountInput.amount,
    isValidAmount,
    isAmountOverBalance: amountInput.isAmountOverBalance,
    isAmountOverLimit,
    errorMessage,
    usdEquivalent: amountInput.usdEquivalent,
    limitInfo,
    maxDepositableFormatted,
    depositLimitStatus,
    onRetryDepositLimit: refetchVault,
    selectedToken: tokenSelection.selectedToken,
    balance: tokenSelection.balance,
    balanceFormatted: tokenSelection.balanceFormatted,
    isNative: tokenSelection.isNative,
    requiresAllowance: tokenSelection.requiresAllowance,
    setAmount: amountInput.setAmount,
    handleAmountChange: amountInput.handleAmountChange,
    handlePercentageClick,
    setSelectedToken: tokenSelection.setSelectedToken,
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
