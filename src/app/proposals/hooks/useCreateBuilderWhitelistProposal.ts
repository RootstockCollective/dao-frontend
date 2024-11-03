import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { GovernorAddress, SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData, getAddress } from 'viem'
import { useWriteContract } from 'wagmi'
import { createProposal, encodeGovernorRelayCallData } from './proposalUtils'
import { useVotingPower } from './useVotingPower'
import { AddressAlreadyWhitelistedError, NoVotingPowerError } from '@/app/proposals/shared/errors'
import { getIsWhitelistedBuilder } from '@/app/collective-rewards/utils/getIsWhitelistedBuilder'

export const useCreateBuilderWhitelistProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onCreateBuilderWhitelistProposal = async (
    builderAddress: Address,
    receiverAddress: Address,
    description: string,
  ) => {
    if (!canCreateProposal) {
      throw NoVotingPowerError
    }
    const isWhitelisted = await getIsWhitelistedBuilder(builderAddress)
    if (isWhitelisted) {
      throw AddressAlreadyWhitelistedError
    }
    const calldata = encodeWhitelistBuilderCalldata(builderAddress, receiverAddress)
    const relayCallData = encodeGovernorRelayCallData(SimplifiedRewardDistributorAddress, calldata)

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

export const encodeWhitelistBuilderCalldata = (builderAddress: Address, receiverAddress: Address) => {
  return encodeFunctionData({
    abi: SimplifiedRewardDistributorAbi,
    functionName: 'whitelistBuilder',
    args: [builderAddress.toLocaleLowerCase() as Address, receiverAddress.toLocaleLowerCase() as Address],
  })
}
