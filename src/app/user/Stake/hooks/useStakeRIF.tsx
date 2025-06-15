import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { useContractWrite } from './useContractWrite'
import { Address, parseEther } from 'viem'
import { useAccount } from 'wagmi'

export const useStakeRIF = (amount: string, tokenToReceiveContract: Address) => {
  const { address } = useAccount()

  const {
    onRequestTransaction: onRequestStake,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: stakeTxHash,
  } = useContractWrite({
    abi: StRIFTokenAbi,
    address: tokenToReceiveContract,
    functionName: 'depositAndDelegate',
    args: [address, parseEther(amount)],
  })

  return {
    onRequestStake,
    isRequesting,
    isTxPending,
    isTxFailed,
    stakeTxHash,
  }
}
