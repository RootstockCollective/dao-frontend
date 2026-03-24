'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { parseEther } from 'viem'

import { formatMetrics } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel, handleAmountInput } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'

import { useRbtcBuffer } from '../../hooks/useRbtcBuffer'
import { useRbtcVault } from '../../hooks/useRbtcVault'
import { reportedOffchainForTargetTotalAssets } from '../../utils'

interface UpdateNavContextValue {
  navAmount: string
  handleNavAmountChange: (value: string) => void
  usdEquivalent: string
  isValidAmount: boolean
  errorMessage: string
  currentNav: ReturnType<typeof formatMetrics>
  effectiveOnDisplay: string
  reportedOffchainWei: bigint | null
  vaultReadsLoading: boolean
  refetchNav: () => Promise<void>
}

const UpdateNavContext = createContext<UpdateNavContextValue | null>(null)

interface Props {
  children: ReactNode
}

export const UpdateNavProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const {
    vaultAssetBalance,
    totalAssets,
    totalPendingDepositAssets,
    totalRedeemRequiredAssets,
    totalRedeemPaidAssets,
    isLoading: isVaultLoading,
    refetchVault,
  } = useRbtcVault()

  const { bufferDebt, isLoading: isBufferLoading, refetchBuffer } = useRbtcBuffer()

  const refetchNav = useCallback(async () => {
    await Promise.all([refetchVault(), refetchBuffer()])
  }, [refetchBuffer, refetchVault])

  const [navAmount, setNavAmount] = useState('')

  const handleNavAmountChange = useCallback((value: string) => {
    setNavAmount(handleAmountInput(value))
  }, [])

  const outstandingRedeems =
    totalRedeemRequiredAssets > totalRedeemPaidAssets ? totalRedeemRequiredAssets - totalRedeemPaidAssets : 0n

  const currentNav = useMemo(() => formatMetrics(totalAssets, rbtcPrice, RBTC), [totalAssets, rbtcPrice])

  const { usdEquivalent, isValidAmount, errorMessage, reportedOffchainWei } = useMemo(() => {
    if (!navAmount) {
      return { usdEquivalent: '', isValidAmount: false, errorMessage: '', reportedOffchainWei: null }
    }

    let usdAmount = ''
    try {
      if (rbtcPrice) {
        usdAmount = formatCurrencyWithLabel(Big(rbtcPrice).mul(navAmount))
      }
    } catch {
      usdAmount = ''
    }

    try {
      if (!Big(navAmount).gt(0)) {
        return {
          usdEquivalent: usdAmount,
          isValidAmount: false,
          errorMessage: '',
          reportedOffchainWei: null,
        }
      }

      const targetWei = parseEther(navAmount)
      const rawReported = reportedOffchainForTargetTotalAssets(
        targetWei,
        vaultAssetBalance,
        outstandingRedeems,
        totalPendingDepositAssets,
        bufferDebt,
      )

      if (rawReported < 0n) {
        return {
          usdEquivalent: usdAmount,
          isValidAmount: false,
          errorMessage:
            'This NAV implies negative reported off-chain assets, which the vault cannot accept. Enter a higher NAV.',
          reportedOffchainWei: null,
        }
      }

      return {
        usdEquivalent: usdAmount,
        isValidAmount: true,
        errorMessage: '',
        reportedOffchainWei: rawReported,
      }
    } catch {
      return {
        usdEquivalent: usdAmount,
        isValidAmount: false,
        errorMessage: 'Enter a valid NAV amount.',
        reportedOffchainWei: null,
      }
    }
  }, [navAmount, rbtcPrice, vaultAssetBalance, outstandingRedeems, totalPendingDepositAssets, bufferDebt])

  const vaultReadsLoading = isVaultLoading || isBufferLoading

  const value: UpdateNavContextValue = {
    navAmount,
    usdEquivalent,
    isValidAmount,
    errorMessage,
    currentNav,
    // Replace this with dynamic data if needed.
    effectiveOnDisplay: 'Immediately',
    reportedOffchainWei,
    vaultReadsLoading,
    refetchNav,
    handleNavAmountChange,
  }

  return <UpdateNavContext.Provider value={value}>{children}</UpdateNavContext.Provider>
}

export const useUpdateNavContext = () => {
  const ctx = useContext(UpdateNavContext)
  if (!ctx) {
    throw new Error('useUpdateNavContext must be used within UpdateNavProvider')
  }
  return ctx
}
