'use client'

import { useCallback } from 'react'
import { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `requestDepositNative()` contract call on the BTC Vault.
 *
 * rBTC is the native currency so `msg.value` carries the deposit amount
 * (no ERC-20 approve step needed). This requires passing `value` to
 * `writeContractAsync`, which the shared `useContractWrite` hook's type
 * doesn't support — so we compose wagmi primitives directly.
 */
export function useSubmitDeposit() {
  const { address } = useAccount()
  const { writeContractAsync, data: depositTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(depositTxHash)

  const onRequestDeposit = useCallback(
    (amount: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      return writeContractAsync({
        ...rbtcVault,
        functionName: 'requestDepositNative',
        value: amount,
      })
    },
    [writeContractAsync, address],
  )

  return {
    onRequestDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    depositTxHash,
  }
}
