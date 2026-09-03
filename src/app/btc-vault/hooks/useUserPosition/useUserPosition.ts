import { useMemo } from 'react'
import { type Address } from 'viem'
import { useBalance, useReadContracts } from 'wagmi'

import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { UserPosition } from '../../services/types'
import { toUserPositionDisplay } from '../../services/ui/mappers'
import type { UserPositionDisplay } from '../../services/ui/types'
import { useUserPrincipal } from './useUserPrincipal'

/**
 * Reads the connected user's BTC vault position from on-chain data.
 *
 * Performs two reads:
 * 1. Native rBTC balance via `useBalance`
 * 2. Vault token balance + total supply + totalAssets via multicall
 *
 * Position value is derived client-side: (vaultTokens * totalAssets) / totalSupply.
 *
 * All queries auto-refresh every 60 seconds and are disabled when wallet is disconnected.
 *
 * @param address - Connected wallet address, or `undefined` if disconnected
 * @returns `{ data, isLoading, isError }` where `data` is a `UserPositionDisplay` or `undefined`
 */
export function useUserPosition(address: Address | undefined): {
  data: UserPositionDisplay | undefined
  isLoading: boolean
  isError: boolean
} {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0
  const isConnected = !!address

  const {
    data: nativeBalance,
    isLoading: isLoadingBalance,
    isError: isBalanceError,
  } = useBalance({
    address,
    query: {
      enabled: isConnected,
      refetchInterval: 60_000,
    },
  })

  const contracts = useMemo(() => {
    if (!address) return []
    return [
      {
        ...rbtcVault,
        functionName: 'balanceOf',
        args: [address],
      } as const,
      {
        ...rbtcVault,
        functionName: 'totalSupply',
      } as const,
      {
        ...rbtcVault,
        functionName: 'totalAssets',
      } as const,
    ]
  }, [address])

  const {
    data: multicallData,
    isLoading: isLoadingMulticall,
    isError: isMulticallError,
  } = useReadContracts({
    contracts,
    query: {
      enabled: isConnected,
      refetchInterval: 60_000,
    },
  })

  const vaultTokens = (multicallData?.[0]?.result as bigint | undefined) ?? 0n
  const totalSupply = (multicallData?.[1]?.result as bigint | undefined) ?? 0n
  const totalAssets = (multicallData?.[2]?.result as bigint | undefined) ?? 0n

  const positionValue = totalSupply > 0n ? (vaultTokens * totalAssets) / totalSupply : 0n

  const {
    data: principalData,
    isLoading: isLoadingPrincipal,
    isError: isPrincipalError,
  } = useUserPrincipal(address)

  const isLoading = isConnected && (isLoadingBalance || isLoadingMulticall || isLoadingPrincipal)
  const isError = isConnected && (isBalanceError || isMulticallError || isPrincipalError)

  const data = useMemo(() => {
    if (!isConnected) return

    const rbtcBalance = nativeBalance?.value ?? 0n
    const percentOfVault = totalSupply > 0n ? Number((vaultTokens * 10000n) / totalSupply) / 100 : 0

    const position: UserPosition = {
      rbtcBalance,
      vaultTokens,
      positionValue,
      percentOfVault,
      totalDepositedPrincipal: principalData ?? 0n,
    }

    return toUserPositionDisplay(position, rbtcPrice)
  }, [isConnected, nativeBalance?.value, vaultTokens, totalSupply, positionValue, rbtcPrice, principalData])

  return { data, isLoading, isError }
}
