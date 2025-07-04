import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

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
      query: {
        refetchInterval: AVERAGE_BLOCKTIME,
      },
    },
  )

  return { delegateeAddress, isLoading, refetch }
}
