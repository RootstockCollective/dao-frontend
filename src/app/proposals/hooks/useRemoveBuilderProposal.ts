import { useCallback } from 'react'
import {
  checkCanCreateProposal,
  createProposal,
  encodeGovernorRelayCallData,
} from '@/app/proposals/hooks/proposalUtils'
import { NoVotingPowerError } from '@/app/proposals/shared/errors'
import { GovernorAbi } from '@/lib/abis/Governor'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress, GovernorAddress } from '@/lib/contracts'
import { Address, encodeFunctionData } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

export const useRemoveBuilderProposal = () => {
  const { address: userAddress } = useAccount()
  const { writeContractAsync: propose, isPending: isPublishing, error: transactionError } = useWriteContract()

  const onRemoveBuilderProposal = useCallback(
    async (builderAddress: Address, description: string) => {
      if (!userAddress) throw new Error('Unknown user address')
      const canCreateProposal = await checkCanCreateProposal(userAddress)
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
    },
    [propose, userAddress],
  )
  return { onRemoveBuilderProposal, isPublishing, transactionError }
}

const encodeRemoveBuilderCalldata = (builderAddress: Address) => {
  return encodeFunctionData({
    abi: BuilderRegistryAbi,
    functionName: 'dewhitelistBuilder',
    args: [builderAddress.toLocaleLowerCase() as Address],
  })
}
