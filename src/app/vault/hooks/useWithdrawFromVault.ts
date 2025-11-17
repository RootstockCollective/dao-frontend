import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useContractWrite } from '@/app/user/Stake/hooks/useContractWrite'

/**
 * Hook to withdraw USDRIF from the vault
 * @param amount - The amount to withdraw in USDRIF
 * @returns Withdraw transaction handlers and status
 */
export const useWithdrawFromVault = (amount: string) => {
  const { address } = useAccount()

  const {
    onRequestTransaction: onRequestWithdraw,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: withdrawTxHash,
  } = useContractWrite({
    ...vault,
    functionName: 'withdraw' as const,
    args: [parseEther(amount), address!, address!] as const,
  })

  return {
    onRequestWithdraw,
    isRequesting,
    isTxPending,
    isTxFailed,
    withdrawTxHash,
  }
}
