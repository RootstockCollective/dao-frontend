'use client'

import { useMemo } from 'react'
import { erc20Abi, formatEther } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'

import { AVERAGE_BLOCKTIME, WRBTC_ADDRESS } from '@/lib/constants'

/**
 * Read native Rootstock coin and WRBTC `balanceOf` for the connected wallet.
 *
 * DEX swaps consume **WRBTC** (ERC-20), not native coin. Summing native + WRBTC is **UX only**
 * (smart default / max hints); users still wrap native elsewhere before swapping from the BTC side.
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
    const combinedWei = nativeWei + wrbtcWei

    return {
      nativeWei,
      wrbtcWei,
      combinedWei,
      combinedBalanceFormatted: formatEther(combinedWei),
      wrbtcBalanceFormatted: formatEther(wrbtcWei),
      isLoading: Boolean(address) && (isNativeLoading || isWrbbtcLoading),
    }
  }, [address, nativeData?.value, wrbtcRaw, isNativeLoading, isWrbbtcLoading])
}
