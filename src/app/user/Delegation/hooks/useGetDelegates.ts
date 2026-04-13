import { Address } from 'viem'
import { useReadContract } from 'wagmi'

import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'

const stRifContract = {
  abi: StRIFTokenAbi,
  address: tokenContracts.stRIF,
}

export const useGetDelegates = (address: Address | undefined) => {
  const {
    data: delegateeAddress,
    isLoading,
    refetch,
  } = useReadContract(
    address && {
      ...stRifContract,
      functionName: 'delegates',
      args: [address],
    },
  )

  return { delegateeAddress, isLoading, refetch }
}
