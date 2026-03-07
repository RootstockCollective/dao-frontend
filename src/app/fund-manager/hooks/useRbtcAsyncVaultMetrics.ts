import { useMemo } from 'react'
import { type Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { formatMetrics } from '@/app/shared/formatter'
import { AVERAGE_BLOCKTIME, RBTC } from '@/lib/constants'
import { rbtcAsyncVault, buffer } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

// TODO: check this comment below
// SAFETY: RBTCAsyncVaultAbi omits `inputs` on parameterless entries,
// which is valid JSON-ABI but violates abitype's strict shape.
// Casting to Abi relaxes the check without altering runtime behaviour.
const vaultAbi = rbtcAsyncVault.abi as unknown as Abi
const bufferAbi = buffer.abi as unknown as Abi

const contracts = [
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'reportedOffchainAssets' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'totalAssets' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'freeOnchainLiquidity' },
  { address: buffer.address, abi: bufferAbi, functionName: 'bufferAssets' },
] as const

/**
 * Reads fund-manager-relevant metrics from the RBTCAsyncVault and Buffer contracts.
 *
 * Mapping:
 * - Current NAV → `reportedOffchainAssets` (off-chain portfolio value reported by fund manager)
 * - Deployed Capital → `totalAssets` (total vault value: on-chain + off-chain)
 * - Unallocated Capital → `freeOnchainLiquidity` (on-chain assets not reserved for redemptions)
 * - Manual Buffer → `bufferAssets` (buffer contract balance)
 */
export function useRbtcAsyncVaultMetrics() {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return useMemo(() => {
    const reportedOffchainAssets = (data?.[0]?.result as bigint | undefined) ?? 0n
    const totalAssets = (data?.[1]?.result as bigint | undefined) ?? 0n
    const freeOnchainLiquidity = (data?.[2]?.result as bigint | undefined) ?? 0n
    const bufferAssets = (data?.[3]?.result as bigint | undefined) ?? 0n

    return {
      currentNav: formatMetrics(reportedOffchainAssets, rbtcPrice, RBTC),
      deployedCapital: formatMetrics(totalAssets, rbtcPrice, RBTC),
      unallocatedCapital: formatMetrics(freeOnchainLiquidity, rbtcPrice, RBTC),
      manualBuffer: formatMetrics(bufferAssets, rbtcPrice, RBTC),
      isLoading,
      error,
    }
  }, [data, rbtcPrice, isLoading, error])
}
