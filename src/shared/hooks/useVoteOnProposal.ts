import { Vote } from '@/components/Modal/VoteProposalModal'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'

const DEFAULT_DAO = {
  address: GovernorAddress as Address,
  abi: GovernorAbi,
}

const VOTES_MAP: Record<Vote, number> = {
  against: 0,
  for: 1,
  abstain: 2,
}

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

export const useVoteOnProposal = (proposalId: string) => {
  const { address } = useAccount()

  // First read the proposal to see if it's active
  const { data: proposalState } = useReadContract({
    ...DEFAULT_DAO,
    functionName: 'state',
    args: [BigInt(proposalId)],
    query: {
      refetchInterval: 5000,
    },
  })

  const isProposalActive = proposalState === 1

  // Second check if the user has already voted
  const { data: hasVoted } = useReadContract({
    ...DEFAULT_DAO,
    functionName: 'hasVoted',
    args: [BigInt(proposalId), address as Address],
    query: {
      refetchInterval: 5000,
    },
  })

  // If everything passed ok - user can vote
  const { writeContractAsync: castVote, isPending: isVoting } = useWriteContract()
  const onVote = (vote: Vote) => {
    if (!isProposalActive) {
      return Promise.reject('The proposal is not active.')
    }
    if (hasVoted) {
      return Promise.reject('The user already voted.')
    }
    return castVote({
      ...DEFAULT_DAO,
      functionName: 'castVote',
      args: [BigInt(proposalId), VOTES_MAP[vote]],
    })
  }

  return {
    onVote,
    isProposalActive,
    didUserVoteAlready: !!hasVoted,
    proposalState,
    proposalStateHuman: proposalState !== undefined ? ProposalState[proposalState] : '',
    isVoting,
  }
}
