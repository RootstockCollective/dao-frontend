'use client'

import { useCallback } from 'react'

import { PauseCard } from './components/PauseCard'
import { usePauseVault } from './hooks/usePauseVault'
import { useVaultPauseState } from './hooks/useVaultPauseState'

export function VaultControlsSection() {
  const { depositsPaused, withdrawalsPaused, refetch } = useVaultPauseState()
  const { pauseDeposits, pauseWithdrawals, isRequesting, isTxPending } = usePauseVault()

  const isSubmitting = isRequesting || isTxPending

  const handlePauseDeposits = useCallback(
    async (paused: boolean) => {
      await pauseDeposits(paused)
      refetch()
    },
    [pauseDeposits, refetch],
  )

  const handlePauseWithdrawals = useCallback(
    async (paused: boolean) => {
      await pauseWithdrawals(paused)
      refetch()
    },
    [pauseWithdrawals, refetch],
  )

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <PauseCard
        title="DEPOSITS"
        description="Pause or resume deposits."
        isPaused={depositsPaused}
        onPause={handlePauseDeposits}
        isSubmitting={isSubmitting}
      />
      <PauseCard
        title="WITHDRAWALS"
        description="Pause or resume withdrawals."
        isPaused={withdrawalsPaused}
        onPause={handlePauseWithdrawals}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
