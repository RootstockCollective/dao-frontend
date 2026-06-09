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

  const depositLimitStatus =
    reportedOffchainAssets !== null
      ? 'ready'
      : vaultBatchError
        ? 'error'
        : isBatchLoading
          ? 'loading'
          : 'error'

  const tokenSelection = useTokenSelection(WRBTC_ADDRESS)

  const reportedOffchainCap = reportedOffchainAssets

  const limitInfo = useMemo(() => {
    if (reportedOffchainAssets === null) return
    return formatMetrics(reportedOffchainAssets, rbtcPrice, RBTC)
  }, [reportedOffchainAssets, rbtcPrice])

  const effectiveMaxWei = useMemo(
    () => effectiveDepositMaxWei(tokenSelection.balance, reportedOffchainCap),
    [tokenSelection.balance, reportedOffchainCap],
  )

  const maxDepositableFormatted = useMemo(
    () =>
      reportedOffchainAssets !== null ? formatMetrics(effectiveMaxWei, rbtcPrice, RBTC).amount : undefined,
    [reportedOffchainAssets, effectiveMaxWei, rbtcPrice],
  )

  const {
    amount,
    isValidAmount: isAmountValid,
    isAmountOverBalance,
    errorMessage: amountErrorMessage,
    usdEquivalent,
    setAmount,
    handleAmountChange,
  } = useAmountInput({
    balance: tokenSelection.balance,
    isNative: tokenSelection.isNative,
    tokenPrice: rbtcPrice,
  })

  const { moveCapitalInBlocking, isAmountOverLimit } = useMemo(() => {
    if (!amount || reportedOffchainAssets === null) {
      return { moveCapitalInBlocking: null, isAmountOverLimit: false }
    }
    try {
      const amountWei = parseUnits(amount, 18)
      const capDisplay = `${formatSymbol(reportedOffchainAssets, RBTC)} ${RBTC}`
      return {
        moveCapitalInBlocking: moveCapitalInBlockingError(amountWei, reportedOffchainCap, capDisplay),
        isAmountOverLimit: isAmountOverReportedOffchain(amountWei, reportedOffchainCap),
      }
    } catch {
      return { moveCapitalInBlocking: null, isAmountOverLimit: false }
    }
  }, [amount, reportedOffchainAssets, reportedOffchainCap])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return amountErrorMessage
    }
    if (isAmountValid && reportedOffchainAssets === null) {
      if (isBatchLoading) {
        return 'Loading deposit limit…'
      }
      return 'Could not load the deposit limit. Please try again.'
    }
    if (moveCapitalInBlocking) {
      return moveCapitalInBlocking
    }
    return amountErrorMessage
  }, [
    isAmountOverBalance,
    isAmountValid,
    amountErrorMessage,
    reportedOffchainAssets,
    isBatchLoading,
    moveCapitalInBlocking,
  ])

  const isValidAmount = useMemo(
    () => isAmountValid && reportedOffchainAssets !== null && !moveCapitalInBlocking,
    [isAmountValid, reportedOffchainAssets, moveCapitalInBlocking],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const baseStr = formatUnits(effectiveMaxWei, 18)
      const calculatedAmount = Big(baseStr).mul(percentage).toFixedNoTrailing(18, 0)
      setAmount(calculatedAmount)
    },
    [effectiveMaxWei, setAmount],
  )

  const value: AmountFlowContextValue = {
    amount,
    isValidAmount,
    isAmountOverBalance,
    isAmountOverLimit,
    errorMessage,
    usdEquivalent,
    limitInfo,
    maxDepositableFormatted,
    depositLimitStatus,
    onRetryDepositLimit: refetchVault,
    selectedToken: tokenSelection.selectedToken,
    balance: tokenSelection.balance,
    balanceFormatted: tokenSelection.balanceFormatted,
    isNative: tokenSelection.isNative,
    requiresAllowance: tokenSelection.requiresAllowance,
    setAmount,
    handleAmountChange,
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
