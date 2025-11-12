import { useMemo } from 'react'
import { parseEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts, vault } from '@/lib/contracts'
import { useContractWrite } from '@/app/user/Stake/hooks/useContractWrite'

/**
 * Hook to check and manage USDRIF allowance for the vault contract
 * @param amount - The amount to check/approve in USDRIF
 * @returns Allowance status and approval transaction handlers
 */
export const useVaultAllowance = (amount: string) => {
  const { address } = useAccount()

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: RIFTokenAbi,
    address: tokenContracts.USDRIF,
    functionName: 'allowance',
    args: [address!, vault.address],
    query: {
      refetchInterval: 5000,
    },
  })

  const isAllowanceEnough = useMemo(
    () => !!(allowanceBalance && allowanceBalance >= parseEther(amount)),
    [amount, allowanceBalance],
  )

  // Memoize the config to prevent infinite loops
  const contractWriteConfig = useMemo(
    () => ({
      abi: RIFTokenAbi,
      address: tokenContracts.USDRIF,
      functionName: 'approve',
      args: [vault.address, parseEther(amount)],
    }),
    [amount],
  )

  const {
    onRequestTransaction: onRequestAllowance,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: allowanceTxHash,
  } = useContractWrite(contractWriteConfig)

  return {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceTxHash,
  }
}
