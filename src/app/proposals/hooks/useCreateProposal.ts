import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { GovernorAbi } from '@/lib/abis/Governor'
import { tokenContracts, GovernorAddress, TreasuryAddress } from '@/lib/contracts'
import { solidityPackedKeccak256 } from 'ethers'
import { Address, encodeFunctionData, parseEther, zeroAddress } from 'viem'
import { useWriteContract } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'

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

const encodeTreasuryERC20Transfer = (address: Address, amountToTransfer: string) => {
  return encodeFunctionData({
    abi: DAOTreasuryAbi,
    functionName: 'withdrawERC20',
    args: [tokenContracts.RIF, address, parseEther(amountToTransfer)],
  })
}

const encodeTreasuryTransfer = (address: Address, amountToTransfer: string) => {
  return encodeFunctionData({
    abi: DAOTreasuryAbi,
    functionName: 'withdraw',
    args: [address, parseEther(amountToTransfer)],
  })
}

const createProposal = (calldata: ReturnType<typeof encodeFunctionData>[], description: string) => {
  const proposal = [[TreasuryAddress], [0n], calldata, description]
  const descriptionHash = solidityPackedKeccak256(['string'], [description])
  const proposalToRunHash = [...proposal.slice(3), descriptionHash]
  return {
    proposal,
    proposalToRunHash,
  }
}
export const useCreateProposal = () => {
  const { canCreateProposal } = useVotingPower()

  const { writeContractAsync: propose, isPending: isPublishing } = useWriteContract()

  const onCreateProposal = async (
    address: Address,
    amount: string,
    description: string,
    tokenAddress: string,
  ) => {
    if (!canCreateProposal) {
      throw new Error('You do not have enough voting power to create a proposal')
    }
    let calldata
    if (tokenAddress === zeroAddress) {
      calldata = encodeTreasuryTransfer(address, amount)
    } else {
      calldata = encodeTreasuryERC20Transfer(address, amount)
    }
    const { proposal } = createProposal([calldata], description)
    return await propose({
      ...DEFAULT_DAO_CONFIG,
      functionName: 'propose', // @ts-ignore
      args: proposal,
    })
  }
  return { onCreateProposal, isPublishing }
}
