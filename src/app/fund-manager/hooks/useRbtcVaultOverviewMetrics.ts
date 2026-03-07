import { useMemo } from 'react'
import { type Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { formatApy, formatMetrics } from '@/app/shared/formatter'
import { AVERAGE_BLOCKTIME, RBTC } from '@/lib/constants'
import { rbtcAsyncVault, syntheticYield } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

// TODO: check this comment below
// SAFETY: ABI omits `inputs` on parameterless entries,
// which is valid JSON-ABI but violates abitype's strict shape.
const vaultAbi = rbtcAsyncVault.abi as unknown as Abi
const syntheticYieldAbi = syntheticYield.abi as unknown as Abi

const SECONDS_PER_YEAR = 31_536_000n
const WEI_PER_BASIS_POINT = 10n ** 9n

const contracts = [
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'totalAssets' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'freeOnchainLiquidity' },
  { address: syntheticYield.address, abi: syntheticYieldAbi, functionName: 'syntheticRatePerSecond' },
] as const

/**
 * Reads overview metrics for Row 1 of the fund manager dashboard.
 *
 * Mapping:
 * - TVL → `totalAssets` (total vault value: on-chain + off-chain)
 * - Liquidity Reserve → `freeOnchainLiquidity` (on-chain assets not reserved for redemptions)
 * - Synthetic Yield APY → computed from `syntheticRatePerSecond`
 * - Vault APY → synthetic yield APY (until full vault APY calculation is available)
 */
export function useRbtcVaultOverviewMetrics() {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return useMemo(() => {
    const totalAssets = (data?.[0]?.result as bigint | undefined) ?? 0n
    const freeOnchainLiquidity = (data?.[1]?.result as bigint | undefined) ?? 0n
    const syntheticRatePerSecond = (data?.[2]?.result as bigint | undefined) ?? 0n

    // Reverse the contract's per-second rate back to APY basis points (1e9 = 100%)
    // Contract formula: ratePerSecond = apyBasisPoints * 1e18 / (SECONDS_PER_YEAR * BASIS_POINTS)
    const syntheticYieldApyBasisPoints = (syntheticRatePerSecond * SECONDS_PER_YEAR) / WEI_PER_BASIS_POINT

    const syntheticYieldApyFormatted = `${formatApy(syntheticYieldApyBasisPoints)}%`

    return {
      tvl: formatMetrics(totalAssets, rbtcPrice, RBTC),
      liquidityReserve: formatMetrics(freeOnchainLiquidity, rbtcPrice, RBTC),
      vaultApy: syntheticYieldApyFormatted,
      syntheticYieldApy: syntheticYieldApyFormatted,
      isLoading,
      error,
    }
  }, [data, rbtcPrice, isLoading, error])
}
