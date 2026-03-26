'use client'

import { useCallback } from 'react'

import { executeTxFlow } from '@/shared/notification'

import { PauseCard } from './components/PauseCard'
import { usePauseVaultDeposits } from './hooks/usePauseVaultDeposits'
import { usePauseVaultWithdrawals } from './hooks/usePauseVaultWithdrawals'
import { useVaultPauseState } from './hooks/useVaultPauseState'

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
        onSuccess: () => refetch(),
      })
    },
    [onRequestDepositTx, refetch],
  )

  const handlePauseWithdrawals = useCallback(
    async (paused: boolean) => {
      await executeTxFlow({
        action: paused ? 'pauseWithdrawals' : 'resumeWithdrawals',
        onRequestTx: onRequestWithdrawalTx,
        onSuccess: () => refetch(),
      })
    },
    [onRequestWithdrawalTx, refetch],
  )

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <PauseCard
        title="DEPOSITS"
        description="Pause or resume deposits."
        isPaused={depositsPaused}
        onPause={handlePauseDeposits}
        isRequesting={isDepositRequesting}
        isTxPending={isDepositTxPending}
      />
      <PauseCard
        title="WITHDRAWALS"
        description="Pause or resume withdrawals."
        isPaused={withdrawalsPaused}
        onPause={handlePauseWithdrawals}
        isRequesting={isWithdrawalRequesting}
        isTxPending={isWithdrawalTxPending}
      />
    </div>
  )
}
