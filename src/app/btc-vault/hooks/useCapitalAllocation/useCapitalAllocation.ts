import { useMemo } from 'react'
import { useBalance, useReadContracts } from 'wagmi'

import {
  TRANSPARENCY_STRATEGY_LABEL,
  TRANSPARENCY_STRATEGY_URL,
  TRANSPARENCY_WALLET_ADDRESS,
  TRANSPARENCY_WALLET_LABEL,
  TRANSPARENCY_WALLET_LABEL_URL,
} from '@/app/btc-vault/components/capital-allocation/WalletBalancesTable.constants'
import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadRbtcBuffer } from '@/shared/hooks/contracts/btc-vault'

import type { CapitalAllocation } from '../../services/types'
import { toCapitalAllocationDisplay } from '../../services/ui/mappers'

const CAPITAL_ALLOCATION_CONTRACTS = [
  { ...rbtcVault, functionName: 'totalAssets' } as const,
  { ...rbtcVault, functionName: 'freeOnchainLiquidity' } as const,
  { ...rbtcVault, functionName: 'reportedOffchainAssets' } as const,
] as const

/**
 * Reads vault capital allocation from chain and enriches with transparency wallet native balance.
 * Liquidity reserve sums vault `freeOnchainLiquidity` and RBTC Buffer `bufferAssets` (same source as `useRbtcBuffer`).
 * `isLoading` reflects vault multicall and buffer read; the wallet balance loads in parallel and updates the table when ready.
 */
export function useCapitalAllocation() {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const {
    data: bufferAssets,
    isLoading: isBufferLoading,
    error: bufferError,
  } = useReadRbtcBuffer({ functionName: 'bufferAssets' })

  const {
    data,
    isLoading: isContractsLoading,
    error,
  } = useReadContracts({
    contracts: CAPITAL_ALLOCATION_CONTRACTS,
    query: {
      refetchInterval: 60_000,
    },
  })

  const { data: transparencyBalance } = useBalance({
    address: TRANSPARENCY_WALLET_ADDRESS,
    query: {
      refetchInterval: 60_000,
    },
  })

  /** Vault + buffer reads; do not block UI on native balance fetch (balance updates when ready). */
  const isLoading = isContractsLoading || isBufferLoading

  const rawAllocation = useMemo((): CapitalAllocation => {
    const totalAssets = (data?.[0]?.result as bigint | undefined) ?? 0n
    const freeOnchainLiquidity = (data?.[1]?.result as bigint | undefined) ?? 0n
    const reportedOffchainAssets = (data?.[2]?.result as bigint | undefined) ?? 0n
    const bufferAssetsWei = bufferAssets ?? 0n

    const wallets: CapitalAllocation['wallets'] = [
      {
        label: TRANSPARENCY_WALLET_LABEL,
        labelUrl: TRANSPARENCY_WALLET_LABEL_URL,
        trackingPlatform: TRANSPARENCY_STRATEGY_LABEL,
        trackingUrl: TRANSPARENCY_STRATEGY_URL,
        amount: transparencyBalance?.value ?? 0n,
        percentOfTotal: 100,
      },
    ]

    return {
      categories: [
        { label: 'Deployed capital', amount: reportedOffchainAssets },
        { label: 'Liquidity reserve', amount: freeOnchainLiquidity + bufferAssetsWei },
        { label: 'Unallocated capital', amount: freeOnchainLiquidity },
      ],
      totalCapital: totalAssets,
      wallets,
    }
  }, [data, transparencyBalance?.value, bufferAssets])

  const display = useMemo(() => {
    if (isContractsLoading || isBufferLoading || error || bufferError) return
    return toCapitalAllocationDisplay(rawAllocation, rbtcPrice)
  }, [rawAllocation, rbtcPrice, isContractsLoading, isBufferLoading, error, bufferError])

  return {
    data: display,
    isLoading,
    isError: !!(error ?? bufferError),
  }
}
