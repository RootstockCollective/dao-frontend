import { config } from '@/config'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { SponsorsManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { readContract } from 'wagmi/actions'

export type BuilderStateStruct = readonly [boolean, boolean, boolean, boolean, boolean, string, string]

export const getBuilderGauge = async (builderAddress: Address): Promise<Address> => {
  return readContract(config, {
    address: SponsorsManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: 'builderToGauge',
    args: [builderAddress],
  })
}
