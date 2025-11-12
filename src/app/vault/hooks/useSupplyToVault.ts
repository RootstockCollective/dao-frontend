import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { vault } from '@/lib/contracts'
import { useContractWrite } from '@/app/user/Stake/hooks/useContractWrite'

/**
 * Hook to supply (deposit) USDRIF to the vault
 * @param amount - The amount to supply in USDRIF
 * @returns Supply transaction handlers and status
 */
export const useSupplyToVault = (amount: string) => {
  const { address } = useAccount()

  const {
    onRequestTransaction: onRequestSupply,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: supplyTxHash,
  } = useContractWrite({
    ...vault,
    functionName: 'deposit',
    args: [parseEther(amount), address],
  })

  return {
    onRequestSupply,
    isRequesting,
    isTxPending,
    isTxFailed,
    supplyTxHash,
  }
}
