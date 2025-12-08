import { useReadContract, useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { vault } from '@/lib/contracts'
import { StrategyAbi } from '@/lib/abis/StrategyAbi'
import { useVaultBalance } from './useVaultBalance'
import { VAULT_BASIS_POINTS } from '@/lib/constants'
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

  // Build contracts array for multicall - fetch totalDeposited and estimatedApy for each strategy
  const strategyContracts = useMemo(() => {
    if (!strategyAddresses || strategyAddresses.length === 0) {
      return []
    }

    const contracts: Array<{
      address: Address
      abi: typeof StrategyAbi
      functionName: 'totalDeposited' | 'estimatedApy'
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

  // Fetch ratioBufferBalance from vault contract
  const {
    data: ratioBufferBalance,
    isLoading: isLoadingRatioBuffer,
    error: ratioBufferError,
  } = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'ratioBufferBalance',
    query: {
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
    if (isLoadingStrategies || isLoadingStrategyData || isLoadingRatioBuffer) {
      return {
        strategies: [] as StrategyInfo[],
        isLoading: true,
        error: undefined,
      }
    }

    if (
      strategiesError ||
      strategyDataError ||
      ratioBufferError ||
      !strategyAddresses ||
      strategyAddresses.length === 0
    ) {
      return {
        strategies: [] as StrategyInfo[],
        isLoading: false,
        error: strategiesError || strategyDataError || ratioBufferError,
      }
    }

    if (!strategyData || strategyData.length === 0) {
      return {
        strategies: [] as StrategyInfo[],
        isLoading: false,
        error: undefined,
      }
    }

    // Process strategy data - each strategy has 2 results (totalDeposited, estimatedApy)
    const strategies: StrategyInfo[] = []
    const totalAssetsBig = Big(totalAssets.toString())

    // Build strategies with calculated percentages and APY
    for (let i = 0; i < strategyAddresses.length; i++) {
      const address = strategyAddresses[i]

      const totalDeposited = (strategyData[i * 2]?.result as bigint | undefined) ?? 0n
      const estimatedApyRaw = (strategyData[i * 2 + 1]?.result as bigint | undefined) ?? 0n

      // Calculate actual APY percentage using VAULT_BASIS_POINTS: estimatedApy / VAULT_BASIS_POINTS * 100
      // This gives us the percentage (e.g., 5 for 5%)
      const estimatedApyBig = Big(estimatedApyRaw.toString())
      const vaultBasisPointsBig = Big(VAULT_BASIS_POINTS.toString())
      // Convert to percentage by dividing by basis points and multiplying by 100
      const estimatedApy = vaultBasisPointsBig.gt(0)
        ? estimatedApyBig.div(vaultBasisPointsBig).mul(100).toNumber()
        : 0

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

    // Add hardcoded Buffer strategy using ratioBufferBalance from vault contract
    const ratioBufferValue = (ratioBufferBalance as bigint | undefined) ?? 0n
    if (ratioBufferValue > 0n) {
      const bufferFundsBig = Big(ratioBufferValue.toString())
      const bufferPercentageAllocated = totalAssetsBig.gt(0)
        ? bufferFundsBig.div(totalAssetsBig).mul(100).toNumber()
        : 0

      strategies.push({
        address: zeroAddress, // Use zero address as placeholder for hardcoded strategy
        name: 'Buffer',
        funds: ratioBufferValue,
        percentageAllocated: bufferPercentageAllocated,
        estimatedApy: 0, // Buffer doesn't earn APY
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
    ratioBufferBalance,
    isLoadingStrategies,
    isLoadingStrategyData,
    isLoadingRatioBuffer,
    strategiesError,
    strategyDataError,
    ratioBufferError,
  ])
}
