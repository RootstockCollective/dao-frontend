'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { parseEther } from 'viem'

import { formatMetrics } from '@/app/shared/formatter'
import { RBTC } from '@/lib/constants'
import { handleAmountInput } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'

import { useRbtcBuffer } from '../../hooks/useRbtcBuffer'
import { useRbtcVault } from '../../hooks/useRbtcVault'
import { reportedOffchainWarningMessages } from './reportedOffchainWarnings'
import {
  computeNavAfterWei,
  formatBpsAsPercent,
  formatPartAsPercentOfWhole,
  navChangeBps,
  navDeltaWei,
  type NavUpdateReview,
  reportedDeltaWei,
} from './updateNavImpact'

interface UpdateNavContextValue {
  /** RBTC amount string for reported off-chain assets (matches `reportOffchainAssetsAndProcessFunding` arg) */
  reportedOffchainAmount: string
  handleReportedOffchainAmountChange: (value: string) => void
  isValidAmount: boolean
  errorMessage: string
  currentNav: ReturnType<typeof formatMetrics>
  /** Before-update snapshot (same as current on-chain NAV) */
  navUpdateReview: NavUpdateReview | null
  currentReportedOffchain: ReturnType<typeof formatMetrics>
  reportedOffchainWei: bigint | null
  /** Manager-review warnings (do not block submit) */
  reportedOffchainWarnings: string[]
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
    reportedOffchainAssets,
    isLoading: isVaultLoading,
    refetchVault,
  } = useRbtcVault()

  const { bufferDebt, isLoading: isBufferLoading, refetchBuffer } = useRbtcBuffer()

  const refetchNav = useCallback(async () => {
    await Promise.all([refetchVault(), refetchBuffer()])
  }, [refetchBuffer, refetchVault])

  const [reportedOffchainAmount, setReportedOffchainAmount] = useState('')

  const handleReportedOffchainAmountChange = useCallback((value: string) => {
    setReportedOffchainAmount(handleAmountInput(value))
  }, [])

  const outstandingRedeems =
    totalRedeemRequiredAssets > totalRedeemPaidAssets ? totalRedeemRequiredAssets - totalRedeemPaidAssets : 0n

  const currentNav = useMemo(() => formatMetrics(totalAssets, rbtcPrice, RBTC), [totalAssets, rbtcPrice])

  const currentReportedOffchain = useMemo((): ReturnType<typeof formatMetrics> => {
    if (reportedOffchainAssets === null) {
      return { amount: '—', fiatAmount: '' }
    }
    return formatMetrics(reportedOffchainAssets, rbtcPrice, RBTC)
  }, [reportedOffchainAssets, rbtcPrice])

  const liabilities = useMemo(
    () => outstandingRedeems + totalPendingDepositAssets + bufferDebt,
    [outstandingRedeems, totalPendingDepositAssets, bufferDebt],
  )

  const { isValidAmount, errorMessage, reportedOffchainWei, navUpdateReview } = useMemo(() => {
    if (!reportedOffchainAmount) {
      return {
        isValidAmount: false,
        errorMessage: '',
        reportedOffchainWei: null,
        navUpdateReview: null,
      }
    }

    if (reportedOffchainAssets === null) {
      return {
        isValidAmount: false,
        errorMessage:
          'Could not load current reported off-chain assets. Please try again or refresh the page.',
        reportedOffchainWei: null,
        navUpdateReview: null,
      }
    }

    const currentReportedOffchainAssets = reportedOffchainAssets

    try {
      const reportedWei = parseEther(reportedOffchainAmount)
      const navAfterWei = computeNavAfterWei(vaultAssetBalance, reportedWei, liabilities)

      if (navAfterWei < 0n) {
        return {
          isValidAmount: false,
          errorMessage:
            'This implies negative total assets (NAV) for the vault. Increase the reported off-chain amount until NAV is positive, or wait for on-chain liabilities to settle.',
          reportedOffchainWei: null,
          navUpdateReview: null,
        }
      }

      const navBeforeWei = totalAssets
      const deltaNav = navDeltaWei(navBeforeWei, navAfterWei)
      const deltaReported = reportedDeltaWei(reportedWei, currentReportedOffchainAssets)
      const navBps = navChangeBps(deltaNav, navBeforeWei)

      const navBeforeFmt = formatMetrics(navBeforeWei, rbtcPrice, RBTC)
      const navAfterFmt = formatMetrics(navAfterWei, rbtcPrice, RBTC)
      const reportedBeforeFmt = formatMetrics(currentReportedOffchainAssets, rbtcPrice, RBTC)
      const reportedNewFmt = formatMetrics(reportedWei, rbtcPrice, RBTC)
      const navDeltaFmt = formatMetrics(deltaNav, rbtcPrice, RBTC)
      const reportedDeltaFmt = formatMetrics(deltaReported, rbtcPrice, RBTC)

      const navUpdateReview: NavUpdateReview = {
        navBeforeWei,
        navBeforeDisplay: navBeforeFmt.amount,
        navAfterDisplay: navAfterFmt.amount,
        navDeltaDisplay: navDeltaFmt.amount,
        reportedBeforeDisplay: reportedBeforeFmt.amount,
        reportedNewDisplay: reportedNewFmt.amount,
        reportedDeltaDisplay: reportedDeltaFmt.amount,
        navDeltaPctDisplay: navBps !== null ? formatBpsAsPercent(navBps) : null,
        reportedPctOfNavBeforeDisplay:
          navBeforeWei === 0n ? null : formatPartAsPercentOfWhole(reportedWei, navBeforeWei),
        navAfterFiatDisplay: navAfterFmt.fiatAmount ?? '',
        reportedNewFiatDisplay: reportedNewFmt.fiatAmount ?? '',
      }

      return {
        isValidAmount: true,
        errorMessage: '',
        reportedOffchainWei: reportedWei,
        navUpdateReview,
      }
    } catch {
      return {
        isValidAmount: false,
        errorMessage: 'Enter a valid amount.',
        reportedOffchainWei: null,
        navUpdateReview: null,
      }
    }
  }, [reportedOffchainAmount, rbtcPrice, vaultAssetBalance, liabilities, totalAssets, reportedOffchainAssets])

  const reportedOffchainWarnings = useMemo(() => {
    if (reportedOffchainWei === null || navUpdateReview === null || reportedOffchainAssets === null) {
      return []
    }
    return reportedOffchainWarningMessages({
      reportedWei: reportedOffchainWei,
      currentReportedWei: reportedOffchainAssets,
      currentTotalAssetsWei: totalAssets,
      isFirstNonZeroReport: reportedOffchainAssets === 0n && reportedOffchainWei > 0n,
      fmt: {
        navBefore: navUpdateReview.navBeforeDisplay,
        navAfter: navUpdateReview.navAfterDisplay,
        navDelta: navUpdateReview.navDeltaDisplay,
        navDeltaPct: navUpdateReview.navDeltaPctDisplay,
        currentReported: navUpdateReview.reportedBeforeDisplay,
        newReported: navUpdateReview.reportedNewDisplay,
        reportedDelta: navUpdateReview.reportedDeltaDisplay,
        pctNewReportedOfNavBefore: navUpdateReview.reportedPctOfNavBeforeDisplay,
      },
    })
  }, [reportedOffchainWei, navUpdateReview, reportedOffchainAssets, totalAssets])

  const vaultReadsLoading = isVaultLoading || isBufferLoading

  const value: UpdateNavContextValue = {
    reportedOffchainAmount,
    handleReportedOffchainAmountChange,
    isValidAmount,
    errorMessage,
    currentNav,
    navUpdateReview,
    currentReportedOffchain,
    reportedOffchainWei,
    reportedOffchainWarnings,
    vaultReadsLoading,
    refetchNav,
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

export type { NavUpdateReview } from './updateNavImpact'
