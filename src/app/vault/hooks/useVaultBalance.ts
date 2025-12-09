import { useReadContracts, useReadContract, useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useMemo } from 'react'
import { WeiPerEther, VAULT_SHARE_MULTIPLIER } from '@/lib/constants'
import { formatSymbol } from '@/app/shared/formatter'

/**
 * Hook for reading vault data using multicall
 * Fetches totalAssets, totalShares (totalSupply), estimatedApy, pricePerShare (via convertToAssets), and user shares (if connected)
 */
export function useVaultBalance() {
  const { address: connectedAddress } = useAccount()

  const contracts = useMemo(() => {
    const baseContracts = [
      {
        address: vault.address,
        abi: vault.abi,
        functionName: 'totalAssets',
      } as const,
      {
        address: vault.address,
        abi: vault.abi,
        functionName: 'totalSupply',
      } as const,
      {
        address: vault.address,
        abi: vault.abi,
        functionName: 'estimatedApy',
      } as const,
      {
        address: vault.address,
        abi: vault.abi,
        functionName: 'convertToAssets',
        args: [WeiPerEther * VAULT_SHARE_MULTIPLIER], // 1 share (1e18 * 1e6) to get price per share
      } as const,
    ]

    if (connectedAddress) {
      return [
        ...baseContracts,
        {
          address: vault.address,
          abi: vault.abi,
          functionName: 'balanceOf', // Returns user shares in ERC4626 vault
          args: [connectedAddress],
        } as const,
      ]
    }

    return baseContracts
  }, [connectedAddress])

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      refetchInterval: 60_000, // Refetch every minute
    },
  })

  // Get user shares first to use in convertToAssets call
  const userShares = connectedAddress && data?.[4]?.result ? (data[4].result as bigint) : 0n

  // Convert user shares to USDRIF assets
  const { data: userUsdrifBalanceRaw, isLoading: isLoadingUserBalance } = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'convertToAssets',
    args: [userShares],
    query: {
      enabled: connectedAddress && userShares > 0n,
      refetchInterval: 60_000, // Refetch every minute
    },
  })

  return useMemo(() => {
    const totalAssets = (data?.[0]?.result as bigint | undefined) ?? 0n
    const totalShares = (data?.[1]?.result as bigint | undefined) ?? 0n
    const estimatedApy = (data?.[2]?.result as bigint | undefined) ?? 0n
    const pricePerShare = (data?.[3]?.result as bigint | undefined) ?? 0n
    const userUsdrifBalance = (userUsdrifBalanceRaw as bigint | undefined) ?? 0n

    const formattedTotalAssets = formatEther(totalAssets)
    const formattedTotalShares = formatSymbol(totalShares, 'cTokenVault')
    const formattedUserShares = formatSymbol(userShares, 'cTokenVault')
    const formattedUserUsdrifBalance = formatSymbol(userUsdrifBalance, 'USDRIF')
    const formattedPricePerShare = formatEther(pricePerShare)

    return {
      totalAssets,
      formattedTotalAssets,
      totalShares,
      formattedTotalShares,
      estimatedApy,
      pricePerShare,
      formattedPricePerShare,
      userShares,
      formattedUserShares,
      userUsdrifBalance,
      formattedUserUsdrifBalance,
      isLoading: isLoading || isLoadingUserBalance,
      error,
    }
  }, [data, isLoading, error, userShares, userUsdrifBalanceRaw, isLoadingUserBalance])
}
