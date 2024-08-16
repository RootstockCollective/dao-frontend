import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'

const DEFAULT_DAO = {
  address: GovernorAddress as Address,
  abi: GovernorAbi,
}

export const useQueueProposal = (proposalId: string) => {
  const { address } = useAccount()

  // Check if proposal needs queuing
  const { data: proposalNeedsQueuing } = useReadContract({
    ...DEFAULT_DAO,
    functionName: 'proposalNeedsQueuing',
    args: [BigInt(proposalId)],
  })

  const { writeContractAsync: queue, isPending: isQueuing } = useWriteContract()

  const onQueueProposal = async () => {
    return queue({
      ...DEFAULT_DAO,
      functionName: 'queue',
      args: [BigInt(proposalId)],
    })
  }

  return {
    proposalNeedsQueuing,
    onQueueProposal,
    isQueuing,
  }
}
