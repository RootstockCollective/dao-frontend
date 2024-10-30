import { useReadContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { GovernorAbi } from '@/lib/abis/Governor'

enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

export const useProposalState = (proposalId: string, shouldRefetch = true) => {
  // First read the proposal to see if it's active
  const { data: proposalState } = useReadContract({
    address: GovernorAddress as Address,
    abi: GovernorAbi,
    functionName: 'state',
    args: [BigInt(proposalId)],
    query: {
      ...(shouldRefetch && { refetchInterval: 5000 }),
    },
  })

  return {
    proposalState,
    proposalStateHuman: proposalState !== undefined ? ProposalState[proposalState] : '',
  }
}
