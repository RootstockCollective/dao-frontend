import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

import { StrategyAbi } from '@/lib/abis/StrategyAbi'
import Big from '@/lib/big'
import { VAULT_BASIS_POINTS } from '@/lib/constants'
import { vault } from '@/lib/contracts'

import { useVaultBalance } from './useVaultBalance'

export interface StrategyInfo {
  address: Address
  name: string
  funds: bigint
  percentageAllocated: number
  estimatedApy: number
}

const INTERVAL = 60_000 // 1 minute

/**
 * Hook for fetching strategies data from vault
 * Fetches strategy addresses, then for each strategy fetches totalDeposited, estimatedApy, and protocolName
 */
export function useStrategies() {
  const { totalAssets, isLoading: isLoadingVaultBalance } = useVaultBalance()

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
      refetchInterval: INTERVAL,
    },
  })

  // Build contracts array for multicall - fetch totalDeposited, estimatedApy, and protocolName for each strategy
  const strategyContracts = useMemo(() => {
    if (!strategyAddresses || strategyAddresses.length === 0) {
      return []
    }

    const contracts: Array<{
      address: Address
      abi: typeof StrategyAbi
      functionName: 'totalDeposited' | 'estimatedApy' | 'protocolName'
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
          functionName: 'protocolName',
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
      refetchInterval: INTERVAL,
    },
  })

  return useMemo(() => {
    if (isLoadingVaultBalance || isLoadingStrategies || isLoadingStrategyData || isLoadingRatioBuffer) {
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

    // Process strategy data - each strategy has 3 results (totalDeposited, estimatedApy, protocolName)
    const strategies: StrategyInfo[] = []
    const totalAssetsBig = Big(totalAssets.toString())

    // Build strategies with calculated percentages and APY
    for (const [i, address] of strategyAddresses.entries()) {
      const totalDeposited = (strategyData[i * 3]?.result as bigint | undefined) ?? 0n
      const estimatedApyRaw = (strategyData[i * 3 + 1]?.result as bigint | undefined) ?? 0n

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

      // Get display name from contract protocolName(), fallback to address if empty
      const protocolNameRaw = (strategyData[i * 3 + 2]?.result as string | undefined) ?? ''
      const contractName = protocolNameRaw.trim() || address

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
    totalAssets,
    ratioBufferBalance,
    isLoadingVaultBalance,
    isLoadingStrategies,
    isLoadingStrategyData,
    isLoadingRatioBuffer,
    strategiesError,
    strategyDataError,
    ratioBufferError,
  ])
}
