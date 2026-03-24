'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `claimDeposit()` contract call to finalize a claimable deposit.
 *
 * After an epoch settles, users with a pending deposit request can call
 * `claimDeposit()` to mint their vault shares.
 */
export function useFinalizeDeposit() {
  const { address } = useAccount()
  const { writeContractAsync, data: finalizeTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(finalizeTxHash)

  const onFinalizeDeposit = useCallback(
    (_claimableAssets: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      return writeContractAsync({
        ...rbtcVault,
        functionName: 'claimDeposit',
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
