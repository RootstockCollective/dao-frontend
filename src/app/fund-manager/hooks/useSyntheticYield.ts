import { type Abi } from 'viem'
import { useReadContract } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { syntheticYield } from '@/lib/contracts'

// SAFETY: ABI omits `inputs` on parameterless entries,
// which is valid JSON-ABI but violates abitype's strict shape.
const syntheticYieldAbi = syntheticYield.abi as unknown as Abi

/**
 * Reads on-chain data from the SyntheticYield contract.
 */
export function useSyntheticYield() {
  const { data, isLoading, error } = useReadContract({
    address: syntheticYield.address,
    abi: syntheticYieldAbi,
    functionName: 'syntheticRatePerSecond',
    query: { refetchInterval: AVERAGE_BLOCKTIME },
  })

  return {
    syntheticRatePerSecond: (data as bigint | undefined) ?? 0n,
    isLoading,
    error,
  }
}
