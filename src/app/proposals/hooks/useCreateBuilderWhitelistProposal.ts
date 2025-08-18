import { AddressAlreadyWhitelistedError, NoVotingPowerError } from '@/app/proposals/shared/errors'
import { config } from '@/config'
import { GovernorAbi } from '@/lib/abis/Governor'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress, GovernorAddress } from '@/lib/contracts'
import { useCallback } from 'react'
import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { checkCanCreateProposal, createProposal, encodeGovernorRelayCallData } from './proposalUtils'

export const useCreateBuilderWhitelistProposal = () => {
  const { address: userAddress } = useAccount()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onCreateBuilderWhitelistProposal = useCallback(
    async (builderAddress: Address, description: string) => {
      const cleanBuilderAddress = getAddress(builderAddress)
      if (!userAddress) throw new Error('Unknown user address')
      const canCreateProposal = await checkCanCreateProposal(userAddress)
      if (!canCreateProposal) {
        throw NoVotingPowerError
      }
      const builderGauge = await readContract(config, {
        address: BuilderRegistryAddress,
        abi: BuilderRegistryAbi,
        functionName: 'builderToGauge',
        args: [cleanBuilderAddress],
      })
      if (builderGauge !== zeroAddress) {
        // TODO: maybe we can use a different error here
        throw AddressAlreadyWhitelistedError
      }
      const calldata = encodeFunctionData({
        abi: BuilderRegistryAbi,
        functionName: 'communityApproveBuilder',
        args: [cleanBuilderAddress],
      })
      const relayCallData = encodeGovernorRelayCallData(BuilderRegistryAddress, calldata)

      const { proposal } = createProposal([GovernorAddress], [0n], [relayCallData], description)

      return await propose({
        abi: GovernorAbi,
        address: GovernorAddress,
        functionName: 'propose',
        args: proposal,
      })
    },
    [propose, userAddress],
  )
  return { onCreateBuilderWhitelistProposal, isPublishing, transactionError }
}
