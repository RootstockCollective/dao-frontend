'use client'

import { useCallback } from 'react'
import { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { rbtcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `requestRedeem()` contract call on the BTC Vault.
 *
 * Key difference from deposit: vault tokens are ERC-20, so no `msg.value`
 * is needed. `minAssetsOut` is hardcoded to `0n` because this is a
 * request-based vault — the final redemption value is determined at
 * epoch settlement, not at request time.
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
        args: [shares, address, address],
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
