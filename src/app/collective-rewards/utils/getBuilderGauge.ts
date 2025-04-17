import { config } from '@/config'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { Address } from 'viem'
import { readContract } from 'wagmi/actions'

export type RawBuilderState = readonly [boolean, boolean, boolean, boolean, boolean, string, string]

export const getBuilderGauge = async (
  builderRegistryAddress: Address,
  builderAddress: Address,
): Promise<Address> => {
  return readContract(config, {
    address: builderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'builderToGauge',
    args: [builderAddress],
  })
}
