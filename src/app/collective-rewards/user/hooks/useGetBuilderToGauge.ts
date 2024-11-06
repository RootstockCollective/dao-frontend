import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetBuilderToGauge = (builder: Address) => {
  return useReadContract({
    address: BackersManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: 'builderToGauge',
    args: [builder],
    query: {
      refetchInterval: 30_000,
    },
  })
}
