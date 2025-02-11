import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useEnvironmentsContext } from '@/shared/context/EnvironmentsContext'

export const useGetBuilderToGauge = (builder: Address) => {
  const { builderRegistryAddress } = useEnvironmentsContext()

  return useReadContract({
    address: builderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'builderToGauge',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
