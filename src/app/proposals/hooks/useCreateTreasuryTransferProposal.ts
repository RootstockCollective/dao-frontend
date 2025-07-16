import { createProposal } from '@/app/proposals/hooks/proposalUtils'
import { NoVotingPowerError } from '@/app/proposals/shared/errors'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress, tokenContracts, TreasuryAddress } from '@/lib/contracts'
import { Address, encodeFunctionData, parseEther, zeroAddress } from 'viem'
import { useWriteContract, useAccount } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { readContracts } from '@wagmi/core'
import { config } from '@/config'

const DEFAULT_DAO_CONFIG = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

/**
 * Check if user can create proposal by fetching fresh data from blockchain
 * Uses the same logic as useVotingPower: totalVotingPower >= proposalThreshold
 */
async function checkCanCreateProposal(userAddress: Address): Promise<boolean> {
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

export const useCreateTreasuryTransferProposal = () => {
  const { address: userAddress } = useAccount()
  const { writeContractAsync: propose, isPending: isPublishing } = useWriteContract()

  const onCreateTreasuryTransferProposal = async (
    address: Address,
    amount: string,
    description: string,
    tokenAddress: string,
  ) => {
    // Check fresh voting power from blockchain
    const canCreate = await checkCanCreateProposal(userAddress!)
    if (!canCreate) {
      throw NoVotingPowerError
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
