import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { GovernorAbi } from '@/lib/abis/Governor'
import { tokenContracts, GovernorAddress } from '@/lib/contracts'
import { solidityPackedKeccak256 } from 'ethers'
import { Address, encodeFunctionData, parseEther } from 'viem'
import { useWriteContract } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'

const DEFAULT_DAO_CONFIG = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

const encodeTransferData = (address: Address, amountToTransfer: string) => {
  return encodeFunctionData({
    abi: RIFTokenAbi,
    functionName: 'transfer',
    args: [address, parseEther(amountToTransfer)],
  })
}

const createProposalForRIFTransfer = (
  calldata: ReturnType<typeof encodeFunctionData>,
  description: string,
) => {
  const proposal = [[tokenContracts.RIF], [0n], [calldata], description]
  const descriptionHash = solidityPackedKeccak256(['string'], [description])
  const proposalToRunHash = [...proposal.slice(3), descriptionHash]
  return {
    proposal,
    proposalToRunHash,
  }
}
export const useCreateProposal = () => {
  const { canCreateProposal } = useVotingPower()

  const { writeContractAsync: propose } = useWriteContract()

  const onCreateProposal = async (address: Address, amount: string, description: string) => {
    if (!canCreateProposal) {
      throw new Error('You do not have enough voting power to create a proposal')
    }

    const calldata = encodeTransferData(address, amount)
    const { proposal } = createProposalForRIFTransfer(calldata, description)
    return await propose({
      ...DEFAULT_DAO_CONFIG,
      functionName: 'propose', // @ts-ignore
      args: proposal,
    })
  }
  return { onCreateProposal }
}
