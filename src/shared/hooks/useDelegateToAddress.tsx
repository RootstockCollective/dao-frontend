import { useWriteContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { STRIF_ADDRESS } from '@/lib/constants'
import { Address } from 'viem'

export const useDelegateToAddress = () => {
  const { writeContractAsync: delegateToAddress, isPending, data: hash } = useWriteContract()

  const onDelegate = (addressToDelegate: string) => {
    return delegateToAddress({
      abi: StRIFTokenAbi,
      address: STRIF_ADDRESS,
      functionName: 'delegate',
      args: [addressToDelegate as Address],
    })
  }

  return { onDelegate, isPending, hash }
}
