import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'

export const useGetBuilderToGauge = (builder: Address) => {
  return useReadContract({
    address: BuilderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'builderToGauge',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
