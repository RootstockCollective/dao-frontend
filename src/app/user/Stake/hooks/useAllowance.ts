import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { RIF, TOKENS } from '@/lib/tokens'
import { useMemo } from 'react'
import { Address, parseEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { useContractWrite } from './useContractWrite'

export const useAllowance = (
  amount: string,
  tokenToSendContract: Address,
  tokenToReceiveContract: Address,
) => {
  const { address } = useAccount()

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: RIFTokenAbi,
    address: TOKENS[RIF].address,
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

  // Memoize the config to prevent infinite loops
  const contractWriteConfig = useMemo(
    () => ({
      abi: RIFTokenAbi,
      address: tokenToSendContract,
      functionName: 'approve',
      args: [tokenToReceiveContract, parseEther(amount)],
    }),
    [tokenToSendContract, tokenToReceiveContract, amount],
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
