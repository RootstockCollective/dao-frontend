import { createProposal } from '@/app/proposals/hooks/proposalUtils'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { NoVotingPowerError } from '@/app/proposals/shared/errors'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress, tokenContracts, TreasuryAddress } from '@/lib/contracts'
import { Address, encodeFunctionData, Hash, parseEther, zeroAddress } from 'viem'
import { useWriteContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from '@/config'
import { useCallback, useMemo } from 'react'

const DEFAULT_DAO_CONFIG = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

export const useCreateTreasuryTransferProposal = () => {
  const { canCreateProposal } = useVotingPower()
  const { writeContractAsync: propose, isPending: isPublishing } = useWriteContract()

  const onCreateTreasuryTransferProposal = useCallback(
    async (address: Address, amount: string, description: string, tokenAddress: string) => {
      console.log('🚀 ~ useCreateTreasuryTransferProposal ~ canCreateProposal:', canCreateProposal)
      if (!canCreateProposal) {
        throw NoVotingPowerError
      }
      let calldata
      if (tokenAddress === zeroAddress) {
        calldata = encodeTreasuryTransfer(address, amount)
      } else {
        calldata = encodeTreasuryERC20Transfer(address, amount)
      }
      const { proposal, proposalToRunHash } = createProposal([TreasuryAddress], [0n], [calldata], description)
      return {
        txHash: await propose({
          ...DEFAULT_DAO_CONFIG,
          functionName: 'propose',
          args: proposal,
        }),
        txId: await getProposalId(proposalToRunHash),
      }
    },
    [canCreateProposal, propose],
  )
  return useMemo(
    () => ({ onCreateTreasuryTransferProposal, isPublishing }),
    [isPublishing, onCreateTreasuryTransferProposal],
  )
}

async function getProposalId(proposal: [Address[], bigint[], Hash[], Hash]): Promise<bigint | undefined> {
  try {
    return await readContract(config, {
      ...DEFAULT_DAO_CONFIG,
      functionName: 'hashProposal',
      args: proposal,
    })
  } catch {
    undefined
  }
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
