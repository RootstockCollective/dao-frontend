import { useMemo } from 'react'
import { parseEther } from 'viem'
import { useReadContracts } from 'wagmi'

import { computeIndicativeApy } from '@/lib/apy'
import { rbtcVault } from '@/lib/contracts'

import type { VaultMetrics } from '../../services/types'
import { toVaultMetricsDisplay } from '../../services/ui/mappers'

const ONE_SHARE = parseEther('1')

function parseEpochSnapshot(tuple: readonly [bigint, bigint, bigint, bigint] | undefined) {
  if (!tuple) return null
  const [closedAt, assetsAtClose, supplyAtClose] = tuple
  if (closedAt === 0n) return null
  return { closedAt, assetsAtClose, supplyAtClose }
}

/**
 * Reads vault metrics from chain via multicall (totalAssets, totalSupply, currentEpoch).
 * APY is computed from two consecutive epoch snapshots using the same compound formula
 * as the Fund Manager dashboard.
 */
export function useVaultMetrics() {
  // Phase 1: read totalAssets, totalSupply, and currentEpoch
  const phase1Contracts = useMemo(
    () => [
      { ...rbtcVault, functionName: 'totalAssets' as const },
      { ...rbtcVault, functionName: 'totalSupply' as const },
      { ...rbtcVault, functionName: 'currentEpoch' as const },
    ],
    [],
  )

  const {
    data: phase1Data,
    isLoading: isLoading1,
    error: error1,
    refetch: refetch1,
  } = useReadContracts({
    contracts: phase1Contracts,
    query: { refetchInterval: 60_000 },
  })

  const currentEpochId = (phase1Data?.[2]?.result as bigint | undefined) ?? undefined
  const lastEpochId = currentEpochId != null && currentEpochId >= 2n ? currentEpochId - 1n : undefined
  const prevEpochId = currentEpochId != null && currentEpochId >= 3n ? currentEpochId - 2n : undefined

  // Phase 2: read epoch snapshots for APY computation
  const phase2Contracts = useMemo(() => {
    const list: Array<typeof rbtcVault & { functionName: string; args: readonly [bigint] }> = []
    if (lastEpochId != null) {
      list.push({ ...rbtcVault, functionName: 'epochSnapshot' as const, args: [lastEpochId] })
    }
    if (prevEpochId != null) {
      list.push({ ...rbtcVault, functionName: 'epochSnapshot' as const, args: [prevEpochId] })
    }
    return list
  }, [lastEpochId, prevEpochId])

  const needsPhase2 = phase2Contracts.length > 0

  const {
    data: phase2Raw,
    isLoading: isLoading2,
    error: error2,
    refetch: refetch2,
  } = useReadContracts({
    contracts: phase2Contracts,
    query: { enabled: needsPhase2, refetchInterval: 60_000 },
  })

  // SAFETY: narrow type to avoid wagmi's "excessively deep" instantiation
  const phase2Data = phase2Raw as readonly { status: string; result?: unknown }[] | undefined

  const isLoading = isLoading1 || (needsPhase2 && isLoading2)
  const error = error1 || error2

  const raw = useMemo((): VaultMetrics | null => {
    if (!phase1Data || phase1Data.length < 3) return null
    const totalAssets = (phase1Data[0]?.result as bigint | undefined) ?? 0n
    const totalSupply = (phase1Data[1]?.result as bigint | undefined) ?? 0n
    const pricePerShare = totalSupply > 0n ? (totalAssets * ONE_SHARE) / totalSupply : 0n

    let apy = 0
    if (phase2Data && phase2Data.length >= 2) {
      const lastSnap =
        phase2Data[0]?.status === 'success'
          ? parseEpochSnapshot(phase2Data[0].result as readonly [bigint, bigint, bigint, bigint])
          : null
      const prevSnap =
        phase2Data[1]?.status === 'success'
          ? parseEpochSnapshot(phase2Data[1].result as readonly [bigint, bigint, bigint, bigint])
          : null
      apy = computeIndicativeApy(lastSnap, prevSnap) ?? 0
    }

    return {
      tvl: totalAssets,
      apy,
      pricePerShare,
      timestamp: Math.floor(Date.now() / 1000),
    }
  }, [phase1Data, phase2Data])

  // SAFETY: wrap refetch calls to avoid wagmi's "excessively deep" type instantiation
  const refetch = async (): Promise<void> => {
    const r1: () => Promise<unknown> = refetch1
    const r2: () => Promise<unknown> = refetch2
    await Promise.all([r1(), r2()])
  }

  return {
    data: raw ? toVaultMetricsDisplay(raw) : null,
    raw,
    isLoading,
    error,
    refetch,
  }
}
