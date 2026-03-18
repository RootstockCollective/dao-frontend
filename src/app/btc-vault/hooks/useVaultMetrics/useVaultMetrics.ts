import { useMemo } from 'react'
import { parseEther } from 'viem'
import { useReadContracts } from 'wagmi'

import { rbtcVault, syntheticYield } from '@/lib/contracts'

import type { VaultMetrics } from '../../services/types'
import { toVaultMetricsDisplay } from '../../services/ui/mappers'

const ONE_SHARE = parseEther('1')

// SyntheticYield: 10_000 = 100%. Vault: 1e9 = 100%. vaultBps = syntheticBps * 100_000
const SYNTHETIC_TO_VAULT_BPS = 100_000n

/**
 * Reads vault metrics from chain via multicall (totalAssets, totalSupply, convertToAssets(1e18)).
 * APY is 0n when SyntheticYield data is missing — TODO: wire when backend or on-chain source is available.
 */
export function useVaultMetrics() {
  const contracts = useMemo(
    () => [
      { ...rbtcVault, functionName: 'totalAssets' as const },
      { ...rbtcVault, functionName: 'convertToAssets' as const, args: [ONE_SHARE] as const },
      { ...rbtcVault, functionName: 'totalSupply' as const },
      { ...syntheticYield, functionName: 'syntheticRatePerSecond' as const },
      { ...syntheticYield, functionName: 'SECONDS_PER_YEAR' as const },
    ],
    [],
  )

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      refetchInterval: 60_000,
    },
  })

  const raw = useMemo((): VaultMetrics | null => {
    if (!data || data.length < 3) return null
    const [totalAssetsResult, convertToAssetsResult, _totalSupplyResult, rateResult, secPerYearResult] = data
    const totalAssets = (totalAssetsResult?.result as bigint | undefined) ?? 0n
    const pricePerShare = (convertToAssetsResult?.result as bigint | undefined) ?? 0n
    // totalSupply available for derived metrics; unused in display
    let apy = 0n
    // TODO: APY has no on-chain source when SyntheticYield data is missing; show 0 until backend or source is wired.
    if (rateResult?.result != null && secPerYearResult?.result != null) {
      const rate = rateResult.result as bigint
      const secPerYear = secPerYearResult.result as bigint
      const syntheticApyBps = (rate * secPerYear) / 10n ** 18n
      apy = syntheticApyBps * SYNTHETIC_TO_VAULT_BPS
    }
    return {
      tvl: totalAssets,
      apy,
      pricePerShare,
      timestamp: Math.floor(Date.now() / 1000),
    }
  }, [data])

  return {
    data: raw ? toVaultMetricsDisplay(raw) : null,
    raw,
    isLoading,
    error,
    refetch,
  }
}
