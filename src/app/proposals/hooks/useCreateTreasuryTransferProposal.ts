import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress, TreasuryAddress } from '@/lib/contracts'
import { Address, zeroAddress } from 'viem'
import { useWriteContract } from 'wagmi'
import {
  createProposal,
  encodeTreasuryERC20Transfer,
  encodeTreasuryTransfer,
} from '@/app/proposals/hooks/proposalUtils'

const DEFAULT_DAO_CONFIG = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

export const useCreateTreasuryTransferProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing } = useWriteContract()

  const onCreateTreasuryTransferProposal = async (
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
    const { proposal } = createProposal([TreasuryAddress], [0n], [calldata], description)
    return propose({
      ...DEFAULT_DAO_CONFIG,
      functionName: 'propose',
      args: proposal,
    })
  }
  return { onCreateTreasuryTransferProposal, isPublishing }
}
