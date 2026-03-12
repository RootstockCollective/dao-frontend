'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

import type { RequestType } from '../../services/types'

/**
 * Hook to cancel a pending deposit or withdrawal request before epoch settlement.
 *
 * - Deposits:    `cancelDepositRequestNative(requestId, receiver, controller)` — returns native rBTC.
 * - Withdrawals: `cancelRedeemRequest(requestId, receiver, controller)` — returns vault shares.
 */
export function useCancelRequest(requestType: RequestType) {
  const { address } = useAccount()
  const { writeContractAsync, data: cancelTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(cancelTxHash)

  const onCancelRequest = useCallback(
    (requestId: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      const functionName = requestType === 'deposit' ? 'cancelDepositRequestNative' : 'cancelRedeemRequest'
      return writeContractAsync({
        ...rbtcVault,
        functionName,
        args: [requestId, address, address],
      })
    },
    [writeContractAsync, address, requestType],
  )

  return {
    onCancelRequest,
    isRequesting,
    isTxPending,
    isTxFailed,
    cancelTxHash,
  }
}
