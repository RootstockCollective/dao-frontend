'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

import type { RequestType } from '../../services/types'

/**
 * Hook to cancel the caller's pending deposit or redeem request before epoch settlement.
 *
 * The vault stores at most one async deposit and one async redeem per address; cancel functions
 * take `owner` only and require `msg.sender == owner`.
 *
 * - Deposits:    `cancelDepositRequestNative(owner)` — refunds native RBTC.
 * - Withdrawals: `cancelRedeemRequest(owner)` — returns escrowed vault shares.
 */
export function useCancelBtcVaultRequest(requestType: RequestType) {
  const { address } = useAccount()
  const { writeContractAsync, data: cancelTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(cancelTxHash)

  const onCancelRequest = useCallback((): Promise<Hash> => {
    if (!address) return Promise.reject(new Error('Wallet not connected'))
    const functionName = requestType === 'deposit' ? 'cancelDepositRequestNative' : 'cancelRedeemRequest'
    return writeContractAsync({
      ...rbtcVault,
      functionName,
      args: [address],
    })
  }, [writeContractAsync, address, requestType])

  return {
    onCancelRequest,
    isRequesting,
    isTxPending,
    isTxFailed,
    cancelTxHash,
  }
}
