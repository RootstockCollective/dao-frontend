import { useCallback, useMemo, useState } from 'react'
import { erc20Abi, formatEther } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'

import { AVERAGE_BLOCKTIME, RBTC, WRBTC, WRBTC_ADDRESS } from '@/lib/constants'

/** Native symbol from `RBTC` (env); wrapped from `WRBTC` (fixed). */
export type RbtcToken = typeof RBTC | typeof WRBTC

/** @deprecated Use `RbtcToken` instead. */
export type SelectedToken = RbtcToken

/**
 * Manages native RBTC / WrBTC token selection and reads the balance for the selected token.
 * Used by fund-manager CTAs that support both native and wrapped RBTC inputs.
 */
export const useRbtcTokenSelection = () => {
  const [selectedToken, setSelectedToken] = useState<RbtcToken>(RBTC)
  const { address } = useAccount()

  const { data: rbtcBalanceData } = useBalance({
    address,
    query: { refetchInterval: AVERAGE_BLOCKTIME },
  })

  const { data: wrbtcBalanceRaw } = useReadContract({
    abi: erc20Abi,
    address: WRBTC_ADDRESS,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const isNative = selectedToken !== WRBTC
  const requiresAllowance = selectedToken === WRBTC

  const balance = useMemo(() => {
    if (isNative) return rbtcBalanceData?.value ?? 0n
    return wrbtcBalanceRaw ?? 0n
  }, [isNative, rbtcBalanceData?.value, wrbtcBalanceRaw])

  const balanceFormatted = useMemo(() => formatEther(balance), [balance])

  const handleTokenChange = useCallback((token: RbtcToken) => {
    setSelectedToken(token)
  }, [])

  return {
    selectedToken,
    balance,
    balanceFormatted,
    isNative,
    requiresAllowance,
    setSelectedToken: handleTokenChange,
  }
}

/** @deprecated Use `useRbtcTokenSelection` instead. */
export const useTokenSelection = useRbtcTokenSelection
