import { useReadContracts, useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useMemo } from 'react'

/**
 * Hook for reading vault data using multicall
 * Fetches totalAssets, estimatedApy, and balanceOf (if connected)
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
    const userBalance = connectedAddress && data?.[2]?.result ? (data[2].result as bigint) : 0n

    const formattedTotalAssets = formatEther(totalAssets)
    const formattedUserBalance = formatEther(userBalance)

    return {
      totalAssets,
      formattedTotalAssets,
      estimatedApy,
      userBalance,
      formattedUserBalance,
      isLoading,
      error,
    }
  }, [data, connectedAddress, isLoading, error])
}
