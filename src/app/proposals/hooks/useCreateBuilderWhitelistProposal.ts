import { getBuilderGauge } from '@/app/collective-rewards/utils'
import { AddressAlreadyWhitelistedError, NoVotingPowerError } from '@/app/proposals/shared/errors'
import { GovernorAbi } from '@/lib/abis/Governor'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { GovernorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData, zeroAddress } from 'viem'
import { useWriteContract } from 'wagmi'
import { createProposal, encodeGovernorRelayCallData } from './proposalUtils'
import { useVotingPower } from './useVotingPower'
import { BuilderRegistryAddress } from '@/lib/contracts'

export const useCreateBuilderWhitelistProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onCreateBuilderWhitelistProposal = async (builderAddress: Address, description: string) => {
    if (!canCreateProposal) {
      throw NoVotingPowerError
    }
    const builderGauge = await getBuilderGauge(BuilderRegistryAddress, builderAddress)
    if (builderGauge !== zeroAddress) {
      // TODO: maybe we can use a different error here
      throw AddressAlreadyWhitelistedError
    }
    const calldata = encodeWhitelistBuilderCalldata(builderAddress)
    const relayCallData = encodeGovernorRelayCallData(BuilderRegistryAddress, calldata)

    const { proposal } = createProposal([GovernorAddress], [0n], [relayCallData], description)

    return await propose({
      abi: GovernorAbi,
      address: GovernorAddress,
      functionName: 'propose',
      args: proposal,
    })
  }
  return { onCreateBuilderWhitelistProposal, isPublishing, transactionError }
}

export const encodeWhitelistBuilderCalldata = (builderAddress: Address) => {
  return encodeFunctionData({
    abi: BuilderRegistryAbi,
    functionName: 'communityApproveBuilder',
    args: [builderAddress.toLocaleLowerCase() as Address],
  })
}
