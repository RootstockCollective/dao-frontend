import { useAccount } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { Address, parseEther } from 'viem'
import { useContractWrite } from './useContractWrite'

export const useUnstakeStRIF = (amount: string, tokenToSendContract: Address) => {
  const { address } = useAccount()

  const {
    onRequestTransaction: onRequestUnstake,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: unstakeTxHash,
  } = useContractWrite({
    abi: StRIFTokenAbi,
    address: tokenToSendContract,
    functionName: 'withdrawTo' as const,
    args: [address!, parseEther(amount)] as const,
  })

  return {
    onRequestUnstake,
    isRequesting,
    isTxPending,
    isTxFailed,
    unstakeTxHash,
  }
}
