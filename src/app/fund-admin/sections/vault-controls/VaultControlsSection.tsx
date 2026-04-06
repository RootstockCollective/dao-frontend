'use client'

import { useCallback } from 'react'

import { executeTxFlow } from '@/shared/notification'

import { usePauseVaultDeposits, usePauseVaultWithdrawals, useVaultPauseState } from './hooks'
import { PauseCard } from './PauseCard'

export function VaultControlsSection() {
  const { depositsPaused, withdrawalsPaused, refetch } = useVaultPauseState()
  const {
    onRequestTransaction: onRequestDepositTx,
    isRequesting: isDepositRequesting,
    isTxPending: isDepositTxPending,
  } = usePauseVaultDeposits(depositsPaused)
  const {
    onRequestTransaction: onRequestWithdrawalTx,
    isRequesting: isWithdrawalRequesting,
    isTxPending: isWithdrawalTxPending,
  } = usePauseVaultWithdrawals(withdrawalsPaused)

  const handlePauseDeposits = useCallback(
    async (paused: boolean) => {
      await executeTxFlow({
        action: paused ? 'pauseDeposits' : 'resumeDeposits',
        onRequestTx: onRequestDepositTx,
        onSuccess: () => void refetch(),
      })
    },
    [onRequestDepositTx, refetch],
  )

  const handlePauseWithdrawals = useCallback(
    async (paused: boolean) => {
      await executeTxFlow({
        action: paused ? 'pauseWithdrawals' : 'resumeWithdrawals',
        onRequestTx: onRequestWithdrawalTx,
        onSuccess: () => void refetch(),
      })
    },
    [onRequestWithdrawalTx, refetch],
  )

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <PauseCard
        title="Deposits"
        description="Pause or resume deposits."
        isPaused={depositsPaused}
        onPause={handlePauseDeposits}
        isRequesting={isDepositRequesting}
        isTxPending={isDepositTxPending}
      />
      <PauseCard
        title="Withdrawals"
        description="Pause or resume withdrawals."
        isPaused={withdrawalsPaused}
        onPause={handlePauseWithdrawals}
        isRequesting={isWithdrawalRequesting}
        isTxPending={isWithdrawalTxPending}
      />
    </div>
  )
}
