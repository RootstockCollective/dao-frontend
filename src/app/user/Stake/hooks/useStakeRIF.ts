import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { useContractWrite } from './useContractWrite'
import { Address, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { useMemo } from 'react'

export const useStakeRIF = (amount: string, tokenToReceiveContract: Address) => {
  const { address } = useAccount()

  // Memoize the config to prevent infinite loops
  const contractWriteConfig = useMemo(
    () => ({
      abi: StRIFTokenAbi,
      address: tokenToReceiveContract,
      functionName: 'depositAndDelegate' as const,
      args: [address!, parseEther(amount)] as const,
    }),
    [tokenToReceiveContract, address, amount],
  )

  const {
    onRequestTransaction: onRequestStake,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: stakeTxHash,
  } = useContractWrite(contractWriteConfig)

  return {
    onRequestStake,
    isRequesting,
    isTxPending,
    isTxFailed,
    stakeTxHash,
  }
}
