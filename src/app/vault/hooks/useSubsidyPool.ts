import { useReadContracts } from 'wagmi'
import { vault } from '@/lib/contracts'
import { SubsidyPoolAbi } from '@/lib/abis/SubsidyPoolAbi'
import { useMemo } from 'react'

/**
 * Hook for fetching subsidy pool data
 * First fetches the subsidy pool address from vault, then fetches estimatedApy from subsidy pool
 */
export function useSubsidyPool() {
  const contracts = useMemo(
    () => [
      {
        address: vault.address,
        abi: vault.abi,
        functionName: 'subsidyPool',
      } as const,
    ],
    [],
  )

  const { data: subsidyPoolAddressData, isLoading: isLoadingAddress } = useReadContracts({
    contracts,
    query: {
      refetchInterval: 60_000, // Refetch every minute
    },
  })

  const subsidyPoolAddress = subsidyPoolAddressData?.[0]?.result as `0x${string}` | undefined

  // Fetch estimatedApy from subsidy pool if we have the address
  const subsidyPoolContracts = useMemo(() => {
    if (!subsidyPoolAddress) return []

    return [
      {
        address: subsidyPoolAddress,
        abi: SubsidyPoolAbi,
        functionName: 'estimatedApy',
      } as const,
    ]
  }, [subsidyPoolAddress])

  const { data: subsidyPoolData, isLoading: isLoadingSubsidyData } = useReadContracts({
    contracts: subsidyPoolContracts,
    query: {
      enabled: subsidyPoolContracts.length > 0,
      refetchInterval: 60_000, // Refetch every minute
    },
  })

  return useMemo(() => {
    const syntheticYield = (subsidyPoolData?.[0]?.result as bigint | undefined) ?? 0n

    return {
      subsidyPoolAddress,
      syntheticYield,
      isLoading: isLoadingAddress || isLoadingSubsidyData,
    }
  }, [subsidyPoolAddress, subsidyPoolData, isLoadingAddress, isLoadingSubsidyData])
}
