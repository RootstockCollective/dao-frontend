import { useMemo } from 'react'
import { Address, parseEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useContractWrite } from './useContractWrite'

export const useAllowance = (
  amount: string,
  tokenToSendContract: Address,
  tokenToReceiveContract: Address,
) => {
  const { address } = useAccount()

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: RIFTokenAbi,
    address: tokenContracts.RIF,
    functionName: 'allowance',
    args: [address!, tokenToReceiveContract],
    query: {
      refetchInterval: 5000,
    },
  })

  const isAllowanceEnough = useMemo(
    () => !!(allowanceBalance && allowanceBalance >= parseEther(amount)),
    [amount, allowanceBalance],
  )

  const {
    onRequestTransaction: onRequestAllowance,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: allowanceTxHash,
  } = useContractWrite({
    abi: RIFTokenAbi,
    address: tokenToSendContract,
    functionName: 'approve',
    args: [tokenToReceiveContract, parseEther(amount)],
  })

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
