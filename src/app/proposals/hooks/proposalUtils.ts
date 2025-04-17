import { GovernorAbi } from '@/lib/abis/Governor'
import { Abi, Address, encodeFunctionData, EncodeFunctionDataReturnType, encodePacked, keccak256 } from 'viem'

export const createProposal = <T extends Abi>(
  targetAddresses: Address[],
  values: bigint[],
  calldata: ReturnType<typeof encodeFunctionData<T>>[],
  description: string,
) => {
  const proposal = [targetAddresses, values, calldata, description] as const
  const descriptionHash = keccak256(encodePacked(['string'], [description]))
  const proposalToRunHash = [...proposal.slice(3), descriptionHash]
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
