import { createProposal, encodeGovernorRelayCallData } from '@/app/proposals/hooks/proposalUtils'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { NoVotingPowerError } from '@/app/proposals/shared/errors'
import { GovernorAbi } from '@/lib/abis/Governor'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress, GovernorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData } from 'viem'
import { useWriteContract } from 'wagmi'

export const useRemoveBuilderProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onRemoveBuilderProposal = async (builderAddress: Address, description: string) => {
    if (!canCreateProposal) {
      throw NoVotingPowerError
    }

    const calldata = encodeRemoveBuilderCalldata(builderAddress)
    const relayCallData = encodeGovernorRelayCallData(BuilderRegistryAddress, calldata)

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
