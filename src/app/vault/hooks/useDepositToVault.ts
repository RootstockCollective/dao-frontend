import { useAccount, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useContractWrite } from '@/app/user/Stake/hooks/useContractWrite'
import { calculateMinSharesOut, DEFAULT_SLIPPAGE_PERCENTAGE } from '../utils/slippage'
import { useMemo } from 'react'

/**
 * Hook to deposit USDRIF to the vault with slippage protection
 * @param amount - The amount to deposit in USDRIF
 * @param slippagePercentage - Custom slippage percentage (defaults to DEFAULT_SLIPPAGE_PERCENTAGE)
 * @returns Deposit transaction handlers and status
 */
export const useDepositToVault = (amount: string, slippagePercentage?: number) => {
  const { address } = useAccount()

  // Get expected shares from previewDeposit
  const { data: expectedShares } = useReadContract({
    ...vault,
    functionName: 'previewDeposit',
    args: [parseEther(amount || '0')],
    query: {
      enabled: !!amount && parseFloat(amount) > 0,
    },
  })

  // Calculate minimum shares out with custom or default slippage
  const minSharesOut = useMemo(() => {
    if (!expectedShares) return 0n
    return calculateMinSharesOut(expectedShares, slippagePercentage ?? DEFAULT_SLIPPAGE_PERCENTAGE)
  }, [expectedShares, slippagePercentage])

  const {
    onRequestTransaction: onRequestDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: depositTxHash,
  } = useContractWrite({
    ...vault,
    functionName: 'depositWithSlippage' as const,
    args: [parseEther(amount || '0'), address!, minSharesOut] as const,
  })

  return {
    onRequestDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    depositTxHash,
  }
}
