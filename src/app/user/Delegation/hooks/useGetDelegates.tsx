import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

const stRifContract = {
  abi: StRIFTokenAbi,
  address: tokenContracts.stRIF,
}

export const useGetDelegates = (address: Address | undefined) => {
  const { data: delegateeAddress, isLoading } = useReadContract(
    address && {
      ...stRifContract,
      functionName: 'delegates',
      args: [address],
      query: {
        refetchInterval: 5000,
      },
    },
  )

  return { delegateeAddress, isLoading }
}
