import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useProposalState } from '@/shared/hooks/useProposalState'
import { useState } from 'react'
import { VOTES_MAP_REVERSE, Vote } from '@/shared/types'

const DEFAULT_DAO = {
  address: GovernorAddress as Address,
  abi: GovernorAbi,
}

export const useVoteOnProposal = (proposalId: string, shouldRefetch = true) => {
  const { address } = useAccount()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  // First read the proposal to see if it's active
  const { proposalState, proposalStateHuman } = useProposalState(proposalId)

  const isProposalActive = proposalState === 1

  // Second check if the user has already voted
  const { data: hasVoted } = useReadContract({
    ...DEFAULT_DAO,
    functionName: 'hasVoted',
    args: [BigInt(proposalId), address as Address],
    query: {
      ...(shouldRefetch && { refetchInterval: 5000 }),
    },
  })

  // If everything passed ok - user can vote
  const { writeContractAsync: castVote, isPending: isVoting, isError } = useWriteContract()
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
      args: [BigInt(proposalId), VOTES_MAP_REVERSE.get(vote) as number],
    })
  }

  // Wait for transaction receipt
  const {
    isLoading: isWaitingVotingReceipt,
    isSuccess: isVotingConfirmed,
    isError: isVotingFailed,
    error: votingError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  return {
    onVote,
    isProposalActive,
    didUserVoteAlready: !!hasVoted,
    proposalState,
    proposalStateHuman,
    isVoting,
    isWaitingVotingReceipt,
    setVotingTxHash: setTxHash,
    isVotingConfirmed,
    isVotingFailed: isVotingFailed || isError,
    votingError,
  }
}
