import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { STRIF, TOKENS } from '@/lib/tokens'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

const stRifContract = {
  abi: StRIFTokenAbi,
  address: TOKENS[STRIF].address,
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
