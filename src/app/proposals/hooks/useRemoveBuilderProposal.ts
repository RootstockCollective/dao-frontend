import { AddressNotWhitelistedError, NoVotingPowerError } from '@/app/proposals/shared/errors'
import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { GovernorAddress, SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData } from 'viem'
import { useWriteContract } from 'wagmi'
import { createProposal, encodeGovernorRelayCallData } from './proposalUtils'
import { useVotingPower } from './useVotingPower'
import { getIsWhitelistedBuilder } from '@/app/collective-rewards/utils/getIsWhitelistedBuilder'

export const useRemoveBuilderProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onRemoveBuilderProposal = async (builderAddress: Address, description: string) => {
    if (!canCreateProposal) {
      throw NoVotingPowerError
    }
    const isWhitelisted = await getIsWhitelistedBuilder(builderAddress)
    if (!isWhitelisted) {
      throw AddressNotWhitelistedError
    }
    const calldata = encodeRemoveBuilderCalldata(builderAddress)
    const relayCallData = encodeGovernorRelayCallData(SimplifiedRewardDistributorAddress, calldata)

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
    abi: SimplifiedRewardDistributorAbi,
    functionName: 'removeWhitelistedBuilder',
    args: [builderAddress.toLocaleLowerCase() as Address],
  })
}
