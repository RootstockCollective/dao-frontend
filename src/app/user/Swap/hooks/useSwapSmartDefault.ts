'use client'

import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/shallow'

import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { RIF, USDRIF, USDT0 } from '@/lib/constants'
import { useSwapStore } from '@/shared/stores/swap'

import { getSmartDefaultSwapDirection } from '../utils/smart-default-direction'
import { useSwapBtcSideBalances } from './useSwapBtcSideBalances'

/**
 * Applies a smart default swap direction when the modal opens.
 *
 * When the user has no spendable USDT0, prefers USDRIF, RIF, or WrBTC (ERC-20) as "From"
 * so they can swap without switching tokens first. Runs once per modal mount after balances load.
 * Does not re-apply on balance refetches, preserving any manual toggle the user makes.
 */
export const useSwapSmartDefault = () => {
  const hasAppliedRef = useRef(false)
  const { balances, isBalancesLoading } = useBalancesContext()
  const { wrbtcBalanceFormatted, isLoading: isWrbtcBalanceLoading } = useSwapBtcSideBalances()
  const { tokenIn, tokenOut, setTokenIn, setTokenOut } = useSwapStore(
    useShallow(state => ({
      tokenIn: state.tokenIn,
      tokenOut: state.tokenOut,
      setTokenIn: state.setTokenIn,
      setTokenOut: state.setTokenOut,
    })),
  )

  // Apply smart default once when balances finish loading on modal mount
  useEffect(() => {
    if (isBalancesLoading || isWrbtcBalanceLoading || hasAppliedRef.current) return

    hasAppliedRef.current = true

    const usdt0Balance = balances[USDT0]?.balance ?? '0'
    const usdrifBalance = balances[USDRIF]?.balance ?? '0'
    const rifBalance = balances[RIF]?.balance ?? '0'
    const smartDefault = getSmartDefaultSwapDirection(
      usdt0Balance,
      usdrifBalance,
      rifBalance,
      wrbtcBalanceFormatted,
    )

    if (smartDefault.tokenIn !== tokenIn || smartDefault.tokenOut !== tokenOut) {
      setTokenIn(smartDefault.tokenIn)
      setTokenOut(smartDefault.tokenOut)
    }
  }, [
    isBalancesLoading,
    isWrbtcBalanceLoading,
    balances,
    wrbtcBalanceFormatted,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
  ])
}
