import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Address, encodeFunctionData, parseEther } from 'viem'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { currentEnvContracts, GovernorAddress } from '@/lib/contracts'
import { solidityPackedKeccak256 } from 'ethers'
import { GovernorAbi } from '@/lib/abis/Governor'
import { useWriteContract } from 'wagmi'

const DEFAULT_DAO_CONFIG = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

const encodeTransferData = (address: Address, amountToTransfer: string) => {
  return encodeFunctionData({
    abi: StRIFTokenAbi,
    functionName: 'transfer',
    args: [address, parseEther(amountToTransfer)],
  })
}

const createProposalForStRifTransfer = (
  calldata: ReturnType<typeof encodeFunctionData>,
  description: string,
) => {
  const proposal = [[currentEnvContracts.stRIF as Address], [0n], [calldata], description]
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
    if (!canCreateProposal) return null

    const calldata = encodeTransferData(address, amount)
    const { proposal, proposalToRunHash } = createProposalForStRifTransfer(calldata, description)
    return await propose({
      ...DEFAULT_DAO_CONFIG,
      functionName: 'propose',
      args: proposal,
    })
  }
  return { onCreateProposal }
}
