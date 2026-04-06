'use client'

import { useMemo } from 'react'
import { erc20Abi, formatEther } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'

import { AVERAGE_BLOCKTIME, WRBTC_ADDRESS } from '@/lib/constants'

/**
 * Read native rBTC and WrBTC `balanceOf` for the connected wallet.
 *
 * Swaps use **WrBTC only** — native rBTC is a separate balance (wrap/unwrap flows can use both later).
 */
export function useSwapBtcSideBalances() {
  const { address } = useAccount()

  const { data: nativeData, isLoading: isNativeLoading } = useBalance({
    address,
    query: {
      enabled: Boolean(address),
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const { data: wrbtcRaw, isLoading: isWrbbtcLoading } = useReadContract({
    address: WRBTC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && WRBTC_ADDRESS),
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return useMemo(() => {
    const nativeWei = nativeData?.value ?? 0n
    const wrbtcWei = typeof wrbtcRaw === 'bigint' ? wrbtcRaw : 0n

    return {
      nativeWei,
      wrbtcWei,
      nativeBalanceFormatted: formatEther(nativeWei),
      wrbtcBalanceFormatted: formatEther(wrbtcWei),
      isLoading: Boolean(address) && (isNativeLoading || isWrbbtcLoading),
    }
  }, [address, nativeData?.value, wrbtcRaw, isNativeLoading, isWrbbtcLoading])
}
