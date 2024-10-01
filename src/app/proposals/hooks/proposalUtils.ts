import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { tokenContracts } from '@/lib/contracts'
import { solidityPackedKeccak256 } from 'ethers'
import { Abi, Address, encodeFunctionData, parseEther } from 'viem'

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

export const encodeWhitelistBuilderCalldata = (builderAddress: Address, receiverAddress: Address) => {
  return encodeFunctionData({
    abi: SimplifiedRewardDistributorAbi,
    functionName: 'whitelistBuilder',
    args: [builderAddress, receiverAddress],
  })
}

export const encodeTreasuryERC20Transfer = (address: Address, amountToTransfer: string) => {
  return encodeFunctionData({
    abi: DAOTreasuryAbi,
    functionName: 'withdrawERC20',
    args: [tokenContracts.RIF, address, parseEther(amountToTransfer)],
  })
}

export const encodeTreasuryTransfer = (address: Address, amountToTransfer: string) => {
  return encodeFunctionData({
    abi: DAOTreasuryAbi,
    functionName: 'withdraw',
    args: [address, parseEther(amountToTransfer)],
  })
}
