import { Address } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { Vote } from '@/components/Modal/VoteProposalModal'
import { GovernorAddress } from '@/lib/contracts'

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

const testProposalId = '25743196385636847333978035955512523618122196623340267139740330247040763887661'

export const useVoteOnProposal = (proposalId: string = testProposalId) => {
  const { address } = useAccount()

  // First read the proposal to see if it's active
  const { data: proposalState } = useReadContract({
    ...DEFAULT_DAO,
    functionName: 'state',
    args: [BigInt(proposalId)],
  })

  const isProposalActive = proposalState === 1

  // Second check if the user has already voted
  const { data: alreadyVoted } = useReadContract({
    ...DEFAULT_DAO,
    functionName: 'hasVoted',
    args: [BigInt(proposalId), address as Address],
  })

  const didUserVoteAlready = alreadyVoted

  // If everything passed ok - user can vote
  const { writeContractAsync } = useWriteContract()
  const onVote = async (vote: Vote) => {
    if (!isProposalActive) {
      return Promise.reject('The proposal is not active.')
    }
    if (didUserVoteAlready) {
      return Promise.reject('The user already voted.')
    }
    return writeContractAsync({
      ...DEFAULT_DAO,
      functionName: 'castVote',
      args: [BigInt(proposalId), VOTES_MAP[vote]],
    })
  }

  return {
    onVote,
    isProposalActive,
    didUserVoteAlready,
    proposalState,
    proposalStateHuman: proposalState ? ProposalState[proposalState] : '',
  }
}
