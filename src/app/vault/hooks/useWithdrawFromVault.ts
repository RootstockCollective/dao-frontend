import { useAccount, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useContractWrite } from '@/app/user/Stake/hooks/useContractWrite'
import { calculateMaxSharesIn, DEFAULT_SLIPPAGE_PERCENTAGE } from '../utils/slippage'
import { useMemo } from 'react'

/**
 * Hook to withdraw USDRIF from the vault with slippage protection
 * @param amount - The amount to withdraw in USDRIF
 * @param slippagePercentage - Custom slippage percentage (defaults to DEFAULT_SLIPPAGE_PERCENTAGE)
 * @returns Withdraw transaction handlers and status
 */
export const useWithdrawFromVault = (amount: string, slippagePercentage?: number) => {
  const { address } = useAccount()

  // Get expected shares from previewWithdraw
  const { data: expectedShares } = useReadContract({
    ...vault,
    functionName: 'previewWithdraw',
    args: [parseEther(amount || '0')],
    query: {
      enabled: !!amount && parseFloat(amount) > 0,
    },
  })

  // Calculate maximum shares in with custom or default slippage
  const maxSharesIn = useMemo(() => {
    if (!expectedShares) return 0n
    return calculateMaxSharesIn(expectedShares, slippagePercentage ?? DEFAULT_SLIPPAGE_PERCENTAGE)
  }, [expectedShares, slippagePercentage])

  const {
    onRequestTransaction: onRequestWithdraw,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: withdrawTxHash,
  } = useContractWrite({
    ...vault,
    functionName: 'withdrawWithSlippage' as const,
    args: [parseEther(amount || '0'), address!, address!, maxSharesIn] as const,
  })

  return {
    onRequestWithdraw,
    isRequesting,
    isTxPending,
    isTxFailed,
    withdrawTxHash,
  }
}
