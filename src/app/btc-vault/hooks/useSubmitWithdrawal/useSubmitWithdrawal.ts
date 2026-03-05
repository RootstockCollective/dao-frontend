'use client'

import { useCallback } from 'react'
import { Hash } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { calculateMinSharesOut, DEFAULT_SLIPPAGE_PERCENTAGE } from '@/app/vault/utils/slippage'
import { btcVault } from '@/lib/contracts'

/**
 * Hook wrapping the `requestRedeem()` contract call on the BTC Vault.
 *
 * Key difference from deposit: vault tokens are ERC-20, so no `msg.value`
 * is needed. The `minAssetsOut` parameter provides slippage protection
 * on the rBTC amount returned.
 *
 * Amount and slippage are passed at call time (not as hook params) so that
 * the caller can invoke the returned function directly without needing a
 * state + useEffect bridge to wait for re-render.
 */
export function useSubmitWithdrawal() {
  const { address } = useAccount()
  const { writeContractAsync, data: withdrawTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(withdrawTxHash)

  const onRequestRedeem = useCallback(
    (shares: bigint, slippagePercentage?: number): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      const minAssetsOut =
        shares === 0n ? 0n : calculateMinSharesOut(shares, slippagePercentage ?? DEFAULT_SLIPPAGE_PERCENTAGE)
      return writeContractAsync({
        ...btcVault,
        functionName: 'requestRedeem',
        args: [shares, address, address, minAssetsOut],
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
