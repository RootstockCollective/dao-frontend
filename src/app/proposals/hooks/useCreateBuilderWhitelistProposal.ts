import { AddressAlreadyWhitelistedError, NoVotingPowerError } from '@/app/proposals/shared/errors'
import { config } from '@/config'
import { GovernorAbi } from '@/lib/abis/Governor'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress, GovernorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData, zeroAddress } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { createProposal, encodeGovernorRelayCallData, checkCanCreateProposal } from './proposalUtils'

export const useCreateBuilderWhitelistProposal = () => {
  const { address: userAddress } = useAccount()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onCreateBuilderWhitelistProposal = async (builderAddress: Address, description: string) => {
    if (!userAddress) throw new Error('Unknown user address')
    const canCreateProposal = await checkCanCreateProposal(userAddress)
    if (!canCreateProposal) {
      throw NoVotingPowerError
    }
    const builderGauge = await readContract(config, {
      address: BuilderRegistryAddress,
      abi: BuilderRegistryAbi,
      functionName: 'builderToGauge',
      args: [builderAddress],
    })
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
