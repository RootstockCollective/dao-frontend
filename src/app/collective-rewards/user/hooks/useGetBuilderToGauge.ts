import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMigrationContext } from '@/shared/context/MigrationContext'

export const useGetBuilderToGauge = (builder: Address) => {
  const { builderRegistryAddress } = useMigrationContext()

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
