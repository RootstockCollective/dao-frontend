import { useWriteContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { GovernorAddress, SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData } from 'viem'
import { useVotingPower } from './useVotingPower'
import { createProposal } from './proposalUtils'

export const useRemoveBuilderProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error } = useWriteContract()

  const onRemoveBuilderProposal = async (builderAddress: Address, description: string) => {
    if (!canCreateProposal) {
      throw new Error('You do not have enough voting power to create a proposal')
    }
    const calldata = encodeRemoveBuilderCalldata(builderAddress)

    const { proposal } = createProposal([SimplifiedRewardDistributorAddress], [0n], [calldata], description)

    return await propose({
      abi: GovernorAbi,
      address: GovernorAddress,
      functionName: 'propose',
      args: proposal,
    })
  }
  return { onRemoveBuilderProposal, isPublishing, error }
}

const encodeRemoveBuilderCalldata = (builderAddress: Address) => {
  return encodeFunctionData({
    abi: SimplifiedRewardDistributorAbi,
    functionName: 'removeWhitelistedBuilder',
    args: [builderAddress],
  })
}
