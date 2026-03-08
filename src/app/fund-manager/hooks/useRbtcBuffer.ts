import { useMemo } from 'react'
import { type Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { buffer } from '@/lib/contracts'

// SAFETY: BufferAbi may omit `inputs` on parameterless entries; casting to Abi relaxes the check.
const bufferAbi = buffer.abi as unknown as Abi

const bufferContracts = [
  { address: buffer.address, abi: bufferAbi, functionName: 'bufferAssets' as const },
  { address: buffer.address, abi: bufferAbi, functionName: 'bufferDebt' as const },
] as const

/**
 * Reads on-chain data from the RBTC Buffer contract.
 *
 * Used by the fund-manager dashboard for Row 1 TVL (bufferDebt) and Liquidity Reserve (bufferAssets).
 */
export function useRbtcBuffer() {
  const { data, isLoading, error } = useReadContracts({
    contracts: bufferContracts,
    query: { refetchInterval: AVERAGE_BLOCKTIME },
  })

  return useMemo(
    () => ({
      bufferAssets: (data?.[0]?.result as bigint | undefined) ?? 0n,
      bufferDebt: (data?.[1]?.result as bigint | undefined) ?? 0n,
      isLoading,
      error,
    }),
    [data, isLoading, error],
  )
}
