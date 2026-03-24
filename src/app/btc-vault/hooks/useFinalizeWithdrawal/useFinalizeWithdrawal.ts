'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `claimRedeemNative()` contract call to finalize a claimable withdrawal.
 *
 * After an epoch settles, users with a pending withdrawal request can call
 * `claimRedeemNative()` to receive native rBTC back.
 *
 * Uses `claimRedeemNative` instead of `claimRedeem` so the user receives native rBTC (not wrapped).
 */
export function useFinalizeWithdrawal() {
  const { address } = useAccount()
  const { writeContractAsync, data: finalizeTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(finalizeTxHash)

  const onFinalizeWithdrawal = useCallback((): Promise<Hash> => {
    if (!address) return Promise.reject(new Error('Wallet not connected'))
    return writeContractAsync({
      ...rbtcVault,
      functionName: 'claimRedeemNative',
    })
  }, [writeContractAsync, address])

  return {
    onFinalizeWithdrawal,
    isRequesting,
    isTxPending,
    isTxFailed,
    finalizeTxHash,
  }
}
