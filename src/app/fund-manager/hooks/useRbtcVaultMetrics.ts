import { useMemo } from 'react'

import { formatMetrics } from '@/app/shared/formatter'
import { RBTC, SECONDS_PER_YEAR, WeiPerEther } from '@/lib/constants'
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
    const syntheticApyDecimal = ratePerSecondDecimal * SECONDS_PER_YEAR
    const syntheticYieldApy = isNaN(syntheticApyDecimal) ? '—' : `${(syntheticApyDecimal * 100).toFixed(2)}%`
    const vaultApy = computeIndicativeApy(lastClosedEpoch, previousClosedEpoch)

    return {
      tvl: formatMetrics(tvlRaw, rbtcPrice, RBTC),
      vaultApy,
      syntheticYieldApy,
      liquidityReserve: formatMetrics(liquidityReserveRaw, rbtcPrice, RBTC),
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
    isLoading,
    error,
  ])
}
