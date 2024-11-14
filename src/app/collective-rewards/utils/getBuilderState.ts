import { config } from '@/config'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { readContract } from 'wagmi/actions'

export type BuilderState = {
  activated: boolean
  kycApproved: boolean
  whitelisted: boolean
  paused: boolean
  revoked: boolean
  reserved: string
  pausedReason: string
}

export const getBuilderState = async (builderAddress: Address): Promise<BuilderState> => {
  const [activated, kycApproved, whitelisted, paused, revoked, reserved, pausedReason] = await readContract(
    config,
    {
      address: BackersManagerAddress,
      abi: BuilderRegistryAbi,
      functionName: 'builderState',
      args: [builderAddress],
    },
  )
  return {
    activated,
    kycApproved,
    whitelisted,
    paused,
    revoked,
    reserved,
    pausedReason,
  }
}