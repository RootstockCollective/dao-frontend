import { AddressNotWhitelistedError, NoVotingPowerError } from '@/app/proposals/shared/errors'
import { GovernorAbi } from '@/lib/abis/Governor'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { GovernorAddress, BackersManagerAddress } from '@/lib/contracts'
import { Address, encodeFunctionData } from 'viem'
import { useWriteContract } from 'wagmi'
import { createProposal, encodeGovernorRelayCallData } from '@/app/proposals/hooks/proposalUtils'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { useBuilderContext } from '@/app/collective-rewards/user'

export const useRemoveBuilderProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()
  const { getBuilderByAddress } = useBuilderContext()

  const onRemoveBuilderProposal = async (builderAddress: Address, description: string) => {
    if (!canCreateProposal) {
      throw NoVotingPowerError
    }

    const { stateFlags } = getBuilderByAddress(builderAddress) || {}
    if (!stateFlags || !stateFlags.communityApproved) {
      throw AddressNotWhitelistedError
    }

    const calldata = encodeRemoveBuilderCalldata(builderAddress)
    const relayCallData = encodeGovernorRelayCallData(BackersManagerAddress, calldata)

    const { proposal } = createProposal([GovernorAddress], [0n], [relayCallData], description)

    return await propose({
      abi: GovernorAbi,
      address: GovernorAddress,
      functionName: 'propose',
      args: proposal,
    })
  }
  return { onRemoveBuilderProposal, isPublishing, transactionError }
}

const encodeRemoveBuilderCalldata = (builderAddress: Address) => {
  return encodeFunctionData({
    abi: BuilderRegistryAbi,
    functionName: 'dewhitelistBuilder',
    args: [builderAddress.toLocaleLowerCase() as Address],
  })
}
