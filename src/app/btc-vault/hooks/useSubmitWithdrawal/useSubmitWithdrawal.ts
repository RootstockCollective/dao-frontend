'use client'

import { useCallback } from 'react'
import { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'
import { useTransactionStatus } from '@/shared/hooks/useTransactionStatus'

/**
 * Hook wrapping the `requestRedeem()` contract call on the BTC Vault.
 *
 * Vault tokens are ERC-20, so no `msg.value` is needed. The final
 * redemption value is determined at epoch settlement, not at request time.
 */
export function useSubmitWithdrawal() {
  const { address } = useAccount()
  const { writeContractAsync, data: withdrawTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(withdrawTxHash)

  const onRequestRedeem = useCallback(
    (shares: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      return writeContractAsync({
        ...rbtcVault,
        functionName: 'requestRedeem',
        args: [shares],
      })
    },
    [writeContractAsync, address],
  )

  return {
    onRequestRedeem,
    isRequesting,
    isTxPending,
    isTxFailed,
    withdrawTxHash,
  }
}
