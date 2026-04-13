import { useCallback, useMemo, useState } from 'react'
import { Address, erc20Abi, formatEther } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'

import { RBTC, WRBTC } from '@/lib/constants'

/** Native symbol from `RBTC` (env); wrapped from `WRBTC` (fixed). */
export type SelectedToken = typeof RBTC | typeof WRBTC

/**
 * Manages native RBTC / WrBTC token selection and reads the balance for the selected token.
 * Used by any fund-manager CTA that supports both native and wrapped token inputs.
 *
 * @param wrbtcAddress - The WrBTC ERC-20 token address (e.g. `WRBTC_ADDRESS` from env)
 */
export const useTokenSelection = (wrbtcAddress: Address) => {
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(RBTC)
  const { address } = useAccount()

  const { data: rbtcBalanceData } = useBalance({
    address,
  })

  const { data: wrbtcBalanceRaw } = useReadContract({
    abi: erc20Abi,
    address: wrbtcAddress,
    functionName: 'balanceOf',
    args: [address!],
  })

  const isNative = selectedToken !== WRBTC
  const requiresAllowance = selectedToken === WRBTC

  const balance = useMemo(() => {
    if (isNative) return rbtcBalanceData?.value ?? 0n
    return wrbtcBalanceRaw ?? 0n
  }, [isNative, rbtcBalanceData?.value, wrbtcBalanceRaw])

  const balanceFormatted = useMemo(() => formatEther(balance), [balance])

  const handleTokenChange = useCallback((token: SelectedToken) => {
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
