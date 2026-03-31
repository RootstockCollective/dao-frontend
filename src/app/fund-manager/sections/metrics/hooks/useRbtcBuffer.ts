import { useCallback } from 'react'

import { useReadRbtcBuffer } from '@/shared/hooks/contracts/btc-vault'

/**
 * Hook for reading on-chain data from the RBTC Buffer contract.
 */
export const useRbtcBuffer = () => {
  const {
    data: bufferAssets,
    isLoading: isLoadingBufferAssets,
    error: errorBufferAssets,
    refetch: refetchBufferAssets,
  } = useReadRbtcBuffer({ functionName: 'bufferAssets' })

  const {
    data: bufferDebt,
    isLoading: isLoadingBufferDebt,
    error: errorBufferDebt,
    refetch: refetchBufferDebt,
  } = useReadRbtcBuffer({ functionName: 'bufferDebt' })

  const refetchBuffer = useCallback(async () => {
    await Promise.all([refetchBufferAssets(), refetchBufferDebt()])
  }, [refetchBufferAssets, refetchBufferDebt])

  return {
    bufferAssets: bufferAssets ?? 0n,
    bufferDebt: bufferDebt ?? 0n,
    isLoading: isLoadingBufferAssets || isLoadingBufferDebt,
    error: errorBufferAssets ?? errorBufferDebt,
    refetchBuffer,
  }
}
