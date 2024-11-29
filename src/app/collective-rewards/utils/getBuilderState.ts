import { config } from '@/config'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { readContract } from 'wagmi/actions'
import { BuilderStateFlags } from '../types'

export const getBuilderState = async (builderAddress: Address): Promise<BuilderStateFlags> => {
  const [activated, kycApproved, communityApproved, paused, revoked] = await readContract(config, {
    address: BackersManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: 'builderState',
    args: [builderAddress],
  })
  return {
    activated,
    kycApproved,
    communityApproved,
    paused,
    revoked,
  }
}
