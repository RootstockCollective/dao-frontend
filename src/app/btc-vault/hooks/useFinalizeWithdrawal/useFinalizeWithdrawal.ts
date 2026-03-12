'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `redeemNative()` contract call to finalize a claimable withdrawal.
 *
 * After an epoch settles, users with a pending withdrawal request can call
 * `redeemNative(claimableShares, receiver, controller)` to receive native rBTC back.
 *
 * Uses `redeemNative` instead of `redeem` so the user receives native rBTC (not wrapped).
 * The caller must supply `claimableShares` from the `claimableRedeemRequest()` read.
 */
export function useFinalizeWithdrawal() {
  const { address } = useAccount()
  const { writeContractAsync, data: finalizeTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(finalizeTxHash)

  const onFinalizeWithdrawal = useCallback(
    (claimableShares: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      return writeContractAsync({
        ...rbtcVault,
        functionName: 'redeemNative',
        args: [claimableShares, address, address],
      })
    },
    [writeContractAsync, address],
  )

  return {
    onFinalizeWithdrawal,
    isRequesting,
    isTxPending,
    isTxFailed,
    finalizeTxHash,
  }
}
