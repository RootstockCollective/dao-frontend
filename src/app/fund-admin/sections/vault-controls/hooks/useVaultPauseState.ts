'use client'

import { useCallback, useMemo } from 'react'

import { useReadRbtcVault } from '@/shared/hooks/contracts/btc-vault'

export function useVaultPauseState() {
  const {
    data: depositsPausedData,
    isLoading: isLoadingDeposits,
    error: errorDeposits,
    refetch: refetchDeposits,
  } = useReadRbtcVault({ functionName: 'depositRequestsPaused' })

  const {
    data: withdrawalsPausedData,
    isLoading: isLoadingWithdrawals,
    error: errorWithdrawals,
    refetch: refetchWithdrawals,
  } = useReadRbtcVault({ functionName: 'redeemRequestsPaused' })

  const refetch = useCallback(async () => {
    await Promise.all([refetchDeposits(), refetchWithdrawals()])
  }, [refetchDeposits, refetchWithdrawals])

  return useMemo(
    () => ({
      depositsPaused: Boolean(depositsPausedData),
      withdrawalsPaused: Boolean(withdrawalsPausedData),
      isLoading: isLoadingDeposits || isLoadingWithdrawals,
      error: errorDeposits || errorWithdrawals,
      refetch,
    }),
    [
      depositsPausedData,
      withdrawalsPausedData,
      isLoadingDeposits,
      isLoadingWithdrawals,
      errorDeposits,
      errorWithdrawals,
      refetch,
    ],
  )
}
