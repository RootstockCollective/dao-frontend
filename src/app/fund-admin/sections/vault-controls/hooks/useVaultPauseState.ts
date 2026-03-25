'use client'

import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

const pauseContracts = [
  { ...rbtcVault, functionName: 'depositRequestsPaused' },
  { ...rbtcVault, functionName: 'redeemRequestsPaused' },
] as const

// TODO: follow the same pattern as useRbtcBuffer
export function useVaultPauseState() {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: pauseContracts,
    query: { enabled: !!rbtcVault.address },
  })

  return useMemo(
    () => ({
      depositsPaused: data?.[0]?.status === 'success' ? (data[0].result ?? false) : false,
      withdrawalsPaused: data?.[1]?.status === 'success' ? (data[1].result ?? false) : false,
      isLoading,
      refetch,
    }),
    [data, isLoading, refetch],
  )
}
