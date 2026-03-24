import { useMemo } from 'react'
import { type Address } from 'viem'
import { useBalance, useReadContract, useReadContracts } from 'wagmi'

import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { UserPosition } from '../../services/types'
import { toUserPositionDisplay } from '../../services/ui/mappers'
import type { UserPositionDisplay } from '../../services/ui/types'

/**
 * Reads the connected user's BTC vault position from on-chain data.
 *
 * Performs three contract reads in a waterfall:
 * 1. Native rBTC balance via `useBalance`
 * 2. Vault token balance + total supply via multicall (`balanceOf`, `totalSupply`)
 * 3. Position value via `convertToAssets(vaultTokens)` (only when vaultTokens > 0)
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

  const {
    data: positionValueRaw,
    isLoading: isLoadingConvert,
    isError: isConvertError,
  } = useReadContract({
    ...rbtcVault,
    functionName: 'convertToAssets',
    args: [vaultTokens],
    query: {
      enabled: isConnected && vaultTokens > 0n,
      refetchInterval: 60_000,
    },
  })

  const positionValue = (positionValueRaw as bigint | undefined) ?? 0n

  const isLoading = isConnected && (isLoadingBalance || isLoadingMulticall || isLoadingConvert)
  const isError = isConnected && (isBalanceError || isMulticallError || isConvertError)

  const data = useMemo(() => {
    if (!isConnected) return

    const rbtcBalance = nativeBalance?.value ?? 0n
    const percentOfVault = totalSupply > 0n ? Number((vaultTokens * 10000n) / totalSupply) / 100 : 0

    const position: UserPosition = {
      rbtcBalance,
      vaultTokens,
      positionValue,
      percentOfVault,
      // TODO: totalDepositedPrincipal requires historical event data (sum of deposits minus withdrawals).
      // Leave as 0n until backend integration is available.
      totalDepositedPrincipal: 0n,
    }

    return toUserPositionDisplay(position, rbtcPrice)
  }, [isConnected, nativeBalance?.value, vaultTokens, totalSupply, positionValue, rbtcPrice])

  return { data, isLoading, isError }
}
