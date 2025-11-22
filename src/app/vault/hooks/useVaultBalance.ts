import { useReadContracts, useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useMemo } from 'react'
import { WeiPerEther } from '@/lib/constants'

/**
 * Hook for reading vault data using multicall
 * Fetches totalAssets, estimatedApy, pricePerShare (via convertToAssets), and balanceOf (if connected)
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
        functionName: 'estimatedApy',
      } as const,
      {
        address: vault.address,
        abi: vault.abi,
        functionName: 'convertToAssets',
        args: [WeiPerEther], // 1 share (1e18) to get price per share
      } as const,
    ]

    if (connectedAddress) {
      return [
        ...baseContracts,
        {
          address: vault.address,
          abi: vault.abi,
          functionName: 'balanceOf',
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

  return useMemo(() => {
    const totalAssets = (data?.[0]?.result as bigint | undefined) ?? 0n
    const estimatedApy = (data?.[1]?.result as bigint | undefined) ?? 0n
    const pricePerShare = (data?.[2]?.result as bigint | undefined) ?? 0n
    const userBalance = connectedAddress && data?.[3]?.result ? (data[3].result as bigint) : 0n

    const formattedTotalAssets = formatEther(totalAssets)
    const formattedUserBalance = formatEther(userBalance)
    const formattedPricePerShare = formatEther(pricePerShare)

    return {
      totalAssets,
      formattedTotalAssets,
      estimatedApy,
      pricePerShare,
      formattedPricePerShare,
      userBalance,
      formattedUserBalance,
      isLoading,
      error,
    }
  }, [data, connectedAddress, isLoading, error])
}
