import { GovernorAbi } from '@/lib/abis/Governor'
import { solidityPackedKeccak256 } from 'ethers'
import { Abi, Address, encodeFunctionData, EncodeFunctionDataReturnType } from 'viem'

export const createProposal = <T extends Abi>(
  targetAddresses: Address[],
  values: bigint[],
  calldata: ReturnType<typeof encodeFunctionData<T>>[],
  description: string,
) => {
  const proposal = [targetAddresses, values, calldata, description] as const
  const descriptionHash = solidityPackedKeccak256(['string'], [description])
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
