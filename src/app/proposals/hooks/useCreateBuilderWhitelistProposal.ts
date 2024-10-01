import { createProposal, encodeWhitelistBuilderCalldata } from '@/app/proposals/hooks/proposalUtils'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress, SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useWriteContract } from 'wagmi'

export const useCreateBuilderWhitelistProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error } = useWriteContract()

  const onCreateBuilderWhitelistProposal = async (
    builderAddress: Address,
    receiverAddress: Address,
    description: string,
  ) => {
    if (!canCreateProposal) {
      throw new Error('You do not have enough voting power to create a proposal')
    }
    const calldata = encodeWhitelistBuilderCalldata(builderAddress, receiverAddress)

    const { proposal } = createProposal([SimplifiedRewardDistributorAddress], [0n], [calldata], description)

    return await propose({
      abi: GovernorAbi,
      address: GovernorAddress,
      functionName: 'propose',
      args: proposal,
    })
  }
  return { onCreateBuilderWhitelistProposal, isPublishing, error }
}
