'use client'

import { useCallback, useMemo } from 'react'
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
 * @param amount  - Deposit amount in Wei (bigint)
 * @param slippagePercentage - Slippage tolerance (e.g. 0.5 = 0.5%)
 */
export function useSubmitDeposit(amount: bigint, slippagePercentage?: number) {
  const { address } = useAccount()

  const minSharesOut = useMemo(() => {
    if (!amount || amount === 0n) return 0n
    return calculateMinSharesOut(amount, slippagePercentage ?? DEFAULT_SLIPPAGE_PERCENTAGE)
  }, [amount, slippagePercentage])

  const { writeContractAsync, data: depositTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(depositTxHash)

  const onRequestDeposit = useCallback((): Promise<Hash> => {
    return writeContractAsync({
      ...btcVault,
      functionName: 'requestDeposit',
      args: [amount, address!, minSharesOut],
      value: amount,
    })
  }, [writeContractAsync, amount, address, minSharesOut])

  return {
    onRequestDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    depositTxHash,
  }
}
