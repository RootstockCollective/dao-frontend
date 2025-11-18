import { useReadContract, useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import { Address } from 'viem'
import { vault } from '@/lib/contracts'
import { StrategyAbi } from '@/lib/abis/StrategyAbi'
import { useVaultBalance } from './useVaultBalance'
import Big from '@/lib/big'
import { useQuery } from '@tanstack/react-query'
import type { StrategyNamesReturnType } from '@/app/vault/api/strategy-name/route'

export interface StrategyInfo {
  address: Address
  name: string
  funds: bigint
  percentageAllocated: number
  estimatedApy: number
}

/**
 * Hook for fetching strategies data from vault
 * Fetches strategy addresses, then for each strategy fetches totalDeposited and estimatedApy
 */
export function useStrategies() {
  const { totalAssets } = useVaultBalance()

  // Fetch strategy addresses from vault
  const {
    data: strategyAddresses,
    isLoading: isLoadingStrategies,
    error: strategiesError,
  } = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'strategies',
    query: {
      refetchInterval: 60_000, // Refetch every minute
    },
  })

  // Build contracts array for multicall - fetch totalDeposited, estimatedApy, and APY_BASIS_POINTS for each strategy
  const strategyContracts = useMemo(() => {
    if (!strategyAddresses || strategyAddresses.length === 0) {
      return []
    }

    const contracts: Array<{
      address: Address
      abi: typeof StrategyAbi
      functionName: 'totalDeposited' | 'estimatedApy' | 'APY_BASIS_POINTS'
    }> = []

    strategyAddresses.forEach(address => {
      contracts.push(
        {
          address,
          abi: StrategyAbi,
          functionName: 'totalDeposited',
        },
        {
          address,
          abi: StrategyAbi,
          functionName: 'estimatedApy',
        },
        {
          address,
          abi: StrategyAbi,
          functionName: 'APY_BASIS_POINTS',
        },
      )
    })

    return contracts
  }, [strategyAddresses])

  // Fetch strategy data using multicall
  const {
    data: strategyData,
    isLoading: isLoadingStrategyData,
    error: strategyDataError,
  } = useReadContracts({
    contracts: strategyContracts,
    query: {
      enabled: strategyContracts.length > 0,
      refetchInterval: 60_000, // Refetch every minute
    },
  })

  // Fetch strategy names from API
  const { data: strategyNames } = useQuery<StrategyNamesReturnType>({
    queryKey: ['strategyNames', strategyAddresses],
    queryFn: async () => {
      if (!strategyAddresses || strategyAddresses.length === 0) {
        return {}
      }
      const response = await fetch('/vault/api/strategy-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: strategyAddresses,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch strategy names: ${response.statusText}`)
      }

      return response.json() as Promise<StrategyNamesReturnType>
    },
    enabled: !!strategyAddresses && strategyAddresses.length > 0,
    staleTime: 3600_000, // 1 hour - matches API revalidate
  })

  return useMemo(() => {
    if (isLoadingStrategies || isLoadingStrategyData) {
      return {
        strategies: [] as StrategyInfo[],
        isLoading: true,
        error: undefined,
      }
    }

    if (strategiesError || strategyDataError || !strategyAddresses || strategyAddresses.length === 0) {
      return {
        strategies: [] as StrategyInfo[],
        isLoading: false,
        error: strategiesError || strategyDataError,
      }
    }

    if (!strategyData || strategyData.length === 0) {
      return {
        strategies: [] as StrategyInfo[],
        isLoading: false,
        error: undefined,
      }
    }

    // Process strategy data - each strategy has 3 results (totalDeposited, estimatedApy, APY_BASIS_POINTS)
    const strategies: StrategyInfo[] = []
    const totalAssetsBig = Big(totalAssets.toString())

    // Build strategies with calculated percentages and APY
    for (let i = 0; i < strategyAddresses.length; i++) {
      const address = strategyAddresses[i]

      const totalDeposited = (strategyData[i * 3]?.result as bigint | undefined) ?? 0n
      const estimatedApyRaw = (strategyData[i * 3 + 1]?.result as bigint | undefined) ?? 0n
      const apyBasisPoints = (strategyData[i * 3 + 2]?.result as bigint | undefined) ?? 1n

      // Calculate actual APY percentage: estimatedApy / APY_BASIS_POINTS * 100
      // This gives us the percentage (e.g., 5 for 5%)
      // We store it in the same format as vault APY (1e9 = 100%) for consistency with formatApy
      const estimatedApyBig = Big(estimatedApyRaw.toString())
      const apyBasisPointsBig = Big(apyBasisPoints.toString())
      // Convert to the format expected by formatApy (1e9 = 100%)
      // estimatedApyPercentage is already a percentage (e.g., 5 for 5%)
      // formatApy expects: value / 1e7 = percentage, so value = percentage * 1e7
      const estimatedApy = apyBasisPointsBig.gt(0) ? estimatedApyBig.div(apyBasisPointsBig).toNumber() : 0

      // Calculate percentage allocated based on vault's totalAssets
      // This shows what percentage of the vault's total funds each strategy represents
      const totalDepositedBig = Big(totalDeposited.toString())
      const percentageAllocated = totalAssetsBig.gt(0)
        ? totalDepositedBig.div(totalAssetsBig).mul(100).toNumber()
        : 0

      // Get contract name from API, fallback to address if not available
      const contractName = strategyNames?.[address] || address

      strategies.push({
        address,
        name: contractName,
        funds: totalDeposited,
        percentageAllocated,
        estimatedApy,
      })
    }

    return {
      strategies,
      isLoading: false,
      error: undefined,
    }
  }, [
    strategyAddresses,
    strategyData,
    strategyNames,
    totalAssets,
    isLoadingStrategies,
    isLoadingStrategyData,
    strategiesError,
    strategyDataError,
  ])
}
