import { useReadContract, useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import { Address } from 'viem'
import { vault } from '@/lib/contracts'
import { StrategyAbi } from '@/lib/abis/StrategyAbi'
import { useVaultBalance } from './useVaultBalance'
import Big from '@/lib/big'
import { log } from 'console'

export interface StrategyInfo {
  address: Address
  name: string
  funds: bigint
  percentageAllocated: number
  estimatedApy: bigint
}

/**
 * Hook for fetching strategies data from vault
 * Fetches strategy addresses, then for each strategy fetches totalDeposited and estimatedApy
 */
export function useStrategies() {
  const { totalAssets } = useVaultBalance()

  // Fetch strategy addresses from vault
  const { data: strategyAddresses, isLoading: isLoadingStrategies, error: strategiesError } = useReadContract({
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
  const { data: strategyData, isLoading: isLoadingStrategyData, error: strategyDataError } = useReadContracts({
    contracts: strategyContracts,
    query: {
      enabled: strategyContracts.length > 0,
      refetchInterval: 60_000, // Refetch every minute
    },
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
      const estimatedApyPercentage = apyBasisPointsBig.gt(0)
        ? estimatedApyBig.div(apyBasisPointsBig).mul(100).toNumber()
        : 0
      
      // Convert to the format expected by formatApy (1e9 = 100%)
      // estimatedApyPercentage is already a percentage (e.g., 5 for 5%)
      // formatApy expects: value / 1e7 = percentage, so value = percentage * 1e7
      const estimatedApy = BigInt(Math.round(estimatedApyPercentage * 1e7))
      console.log({ totalAssets, totalDeposited })
      // Calculate percentage allocated based on vault's totalAssets
      // This shows what percentage of the vault's total funds each strategy represents
      const totalDepositedBig = Big(totalDeposited.toString())
      const percentageAllocated =
        totalAssetsBig.gt(0) ? totalDepositedBig.div(totalAssetsBig).mul(100).toNumber() : 0

      strategies.push({
        address,
        name: address, // Will be truncated in component, can be enhanced with Blockscout API later
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
  }, [strategyAddresses, strategyData, totalAssets, isLoadingStrategies, isLoadingStrategyData, strategiesError, strategyDataError])
}

