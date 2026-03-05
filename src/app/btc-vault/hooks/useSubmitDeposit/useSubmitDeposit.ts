'use client'

import { useCallback } from 'react'
import { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { btcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `requestDeposit()` contract call on the BTC Vault.
 *
 * Key difference from USDRIF vault: rBTC is the native currency so
 * `msg.value` carries the deposit amount (no ERC-20 approve step needed).
 * This requires passing `value` to `writeContractAsync`, which the shared
 * `useContractWrite` hook's type doesn't support — so we compose wagmi
 * primitives directly.
 *
 * `minSharesOut` is hardcoded to `0n` because this is a request-based vault:
 * shares are minted at the NAV confirmed at epoch close, not at request time,
 * so slippage protection on the request is not applicable.
 */
export function useSubmitDeposit() {
  const { address } = useAccount()
  const { writeContractAsync, data: depositTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(depositTxHash)

  const onRequestDeposit = useCallback(
    (amount: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      return writeContractAsync({
        ...btcVault,
        functionName: 'requestDeposit',
        args: [amount, address, 0n],
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
