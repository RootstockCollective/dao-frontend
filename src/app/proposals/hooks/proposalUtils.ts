import { GovernorAbi } from '@/lib/abis/Governor'
import {
  Abi,
  Address,
  encodeFunctionData,
  EncodeFunctionDataReturnType,
  encodePacked,
  Hash,
  keccak256,
} from 'viem'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { readContracts } from '@wagmi/core'
import { config } from '@/config'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'

const DEFAULT_DAO_CONFIG = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

export const createProposal = <T extends Abi>(
  targetAddresses: Address[],
  values: bigint[],
  calldata: ReturnType<typeof encodeFunctionData<T>>[],
  description: string,
) => {
  const proposal = [targetAddresses, values, calldata, description] as const
  const descriptionHash = keccak256(encodePacked(['string'], [description]))
  const proposalToRunHash = [...proposal.slice(3), descriptionHash] as [Address[], bigint[], Hash[], Hash]
  return {
    proposal,
    proposalToRunHash,
  }
}

export const encodeGovernorRelayCallData = (target: Address, calldata: EncodeFunctionDataReturnType) => {
  return encodeFunctionData({
    abi: GovernorAbi,
    functionName: 'relay',
    args: [target, 0n, calldata],
  })
}

/**
 * Check if user can create proposal by fetching fresh data from blockchain
 * Uses the same logic as useVotingPower: totalVotingPower >= proposalThreshold
 */
export async function checkCanCreateProposal(userAddress: Address): Promise<boolean> {
  const [votingPower, proposalThreshold] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'getVotes',
        args: [userAddress],
      },
      {
        ...DEFAULT_DAO_CONFIG,
        functionName: 'proposalThreshold',
      },
    ],
  })
  return votingPower >= proposalThreshold
}
