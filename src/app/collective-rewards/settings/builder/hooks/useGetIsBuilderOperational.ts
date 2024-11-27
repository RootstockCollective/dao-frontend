import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { Address } from 'viem'

export const useGetIsBuilderOperational = (builder: Address) => {
  return useReadContract({
    address: BackersManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: 'isBuilderOperational',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
