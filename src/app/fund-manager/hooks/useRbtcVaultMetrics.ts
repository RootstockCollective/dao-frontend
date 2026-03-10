import { useMemo } from 'react'

import { formatMetrics } from '@/app/shared/formatter'
import { ratePerSecondToApy } from '@/lib/apy'
import { RBTC, WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadSyntheticYield } from '@/shared/hooks/contracts/btc-vault'

import { computeIndicativeApy } from '../utils'
import { useRbtcBuffer } from './useRbtcBuffer'
import { useRbtcVault } from './useRbtcVault'

/**
 * Aggregates all RBTC vault metrics for the fund-manager dashboard.
 *
 * Composes contract-level hooks (useRbtcVault, useSyntheticYield, useRbtcBuffer),
 * returning formatted metrics for all rows.
 *
 * Row 1: TVL, Vault APY, Synthetic Yield APY, Liquidity Reserve.
 * Row 2: Current NAV, Deployed Capital, Unallocated Capital, Manual Buffer.
 */
export const useRbtcVaultMetrics = () => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const {
    vaultAssetBalance,
    reportedOffchainAssets,
    freeOnchainLiquidity,
    lastClosedEpoch,
    previousClosedEpoch,
    totalAssets,
    isLoading: isLoadingVault,
    error: vaultError,
  } = useRbtcVault()

  const {
    data: syntheticRatePerSecond,
    isLoading: isLoadingSynthetic,
    error: syntheticError,
  } = useReadSyntheticYield({ functionName: 'syntheticRatePerSecond' })

  const { bufferAssets, bufferDebt, isLoading: isLoadingBuffer, error: bufferError } = useRbtcBuffer()

  const isLoading = isLoadingVault || isLoadingSynthetic || isLoadingBuffer
  const error = vaultError ?? syntheticError ?? bufferError ?? null

  return useMemo(() => {
    const tvlSum = vaultAssetBalance + reportedOffchainAssets - bufferDebt
    const tvlRaw = tvlSum < 0n ? 0n : tvlSum
    const liquidityReserveRaw = freeOnchainLiquidity + bufferAssets
    const ratePerSecondDecimal = Number(syntheticRatePerSecond) / Number(WeiPerEther)
    const syntheticApyDecimal = ratePerSecondToApy(ratePerSecondDecimal)
    const syntheticYieldApy = isNaN(syntheticApyDecimal) ? '—' : `${(syntheticApyDecimal * 100).toFixed(2)}%`
    const vaultApy = computeIndicativeApy(lastClosedEpoch, previousClosedEpoch)

    return {
      row1: {
        tvl: formatMetrics(tvlRaw, rbtcPrice, RBTC),
        vaultApy,
        syntheticYieldApy,
        liquidityReserve: formatMetrics(liquidityReserveRaw, rbtcPrice, RBTC),
      },
      row2: {
        currentNav: formatMetrics(totalAssets, rbtcPrice, RBTC),
        deployedCapital: formatMetrics(reportedOffchainAssets, rbtcPrice, RBTC),
        unallocatedCapital: formatMetrics(freeOnchainLiquidity, rbtcPrice, RBTC),
        manualBuffer: formatMetrics(bufferAssets, rbtcPrice, RBTC),
      },
      isLoading,
      error,
    }
  }, [
    vaultAssetBalance,
    reportedOffchainAssets,
    freeOnchainLiquidity,
    bufferAssets,
    bufferDebt,
    syntheticRatePerSecond,
    lastClosedEpoch,
    previousClosedEpoch,
    rbtcPrice,
    totalAssets,
    isLoading,
    error,
  ])
}
