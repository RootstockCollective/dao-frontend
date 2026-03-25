'use client'

import { useCallback } from 'react'
import { useWriteContract } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'
import { useTransactionStatus } from '@/shared/hooks/useTransactionStatus'

// TODO: use useContractWrite for supporting notifications
export function usePauseVault() {
  const { writeContractAsync, data: txHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(txHash)

  const pauseDeposits = useCallback(
    (paused: boolean) =>
      writeContractAsync({
        ...rbtcVault,
        functionName: 'setDepositRequestsPaused',
        args: [paused],
      }),
    [writeContractAsync],
  )

  const pauseWithdrawals = useCallback(
    (paused: boolean) =>
      writeContractAsync({
        ...rbtcVault,
        functionName: 'setRedeemRequestsPaused',
        args: [paused],
      }),
    [writeContractAsync],
  )

  return {
    pauseDeposits,
    pauseWithdrawals,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash,
  }
}
