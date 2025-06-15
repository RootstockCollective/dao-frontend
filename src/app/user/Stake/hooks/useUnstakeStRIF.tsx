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
    functionName: 'withdrawTo',
    args: [address, parseEther(amount)],
  })

  return {
    onRequestUnstake,
    isRequesting,
    isTxPending,
    isTxFailed,
    unstakeTxHash,
  }
}
