import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { SimplifiedRewardDistributorAddress, SponsorsManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetIsWhitelistedBuilder = (builder: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: SimplifiedRewardDistributorAbi,
    address: SimplifiedRewardDistributorAddress,
    functionName: 'isWhitelisted',
    args: [builder],
    query: {
      // 30 seconds, it's the mean time required for a block to be included in RSKJ
      refetchInterval: AVERAGE_BLOCKTIME,
      initialData: false,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}

export const useGetIsWhitelistedBuilderV2 = (builder: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: BuilderRegistryAbi,
    address: SponsorsManagerAddress,
    functionName: 'isBuilderOperational',
    args: [builder],
    query: {
      // 30 seconds, it's the mean time required for a block to be included in RSKJ
      refetchInterval: AVERAGE_BLOCKTIME,
      initialData: false,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
