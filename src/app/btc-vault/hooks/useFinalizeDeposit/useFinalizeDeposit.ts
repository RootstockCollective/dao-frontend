'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `deposit()` contract call to finalize a claimable deposit.
 *
 * After an epoch settles, users with a pending deposit request can call
 * `deposit(claimableAssets, receiver, controller)` to mint their vault shares.
 *
 * The caller must supply `claimableAssets` from the `claimableDepositRequest()` read.
 */
export function useFinalizeDeposit() {
  const { address } = useAccount()
  const { writeContractAsync, data: finalizeTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(finalizeTxHash)

  const onFinalizeDeposit = useCallback(
    (claimableAssets: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      return writeContractAsync({
        ...rbtcVault,
        functionName: 'deposit',
        args: [claimableAssets, address, address],
      })
    },
    [writeContractAsync, address],
  )

  return {
    onFinalizeDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    finalizeTxHash,
  }
}
