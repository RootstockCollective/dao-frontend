import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useContractWrite } from '@/app/user/Stake/hooks/useContractWrite'

/**
 * Hook to deposit USDRIF to the vault
 * @param amount - The amount to deposit in USDRIF
 * @returns Deposit transaction handlers and status
 */
export const useDepositToVault = (amount: string) => {
  const { address } = useAccount()

  const {
    onRequestTransaction: onRequestDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: depositTxHash,
  } = useContractWrite({
    ...vault,
    functionName: 'deposit' as const,
    args: [parseEther(amount), address!] as const,
  })

  return {
    onRequestDeposit,
    isRequesting,
    isTxPending,
    isTxFailed,
    depositTxHash,
  }
}
