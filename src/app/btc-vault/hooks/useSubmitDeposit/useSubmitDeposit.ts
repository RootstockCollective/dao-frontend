'use client'

import { useCallback } from 'react'
import { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { calculateMinSharesOut, DEFAULT_SLIPPAGE_PERCENTAGE } from '@/app/vault/utils/slippage'
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
 * Amount and slippage are passed at call time (not as hook params) so that
 * the caller can invoke the returned function directly without needing a
 * state + useEffect bridge to wait for re-render.
 */
export function useSubmitDeposit() {
  const { address } = useAccount()
  const { writeContractAsync, data: depositTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(depositTxHash)

  const onRequestDeposit = useCallback(
    (amount: bigint, slippagePercentage?: number): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      const minSharesOut =
        amount === 0n ? 0n : calculateMinSharesOut(amount, slippagePercentage ?? DEFAULT_SLIPPAGE_PERCENTAGE)
      return writeContractAsync({
        ...btcVault,
        functionName: 'requestDeposit',
        args: [amount, address, minSharesOut],
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
