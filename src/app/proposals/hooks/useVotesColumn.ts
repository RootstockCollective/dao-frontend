import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { governor } from '@/lib/contracts'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { type LatestProposalResponse } from './useFetchLatestProposals'

const sumVotes = (votes: string[]) => votes.reduce((prev, next) => Number(next) + prev, 0)

interface Props {
  proposals: LatestProposalResponse[]
}

/**
 * Get data for Votes column in Proposals table
 */
export function useVotesColumn({ proposals }: Props) {
  // reading votes cast for all proposals
  const { data: proposalVotes } = useReadContracts({
    contracts: proposals.map(proposal => ({
      ...governor,
      functionName: 'proposalVotes',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: bigint[] }> }

  // reading quorums for each proposal snapshot
  const { data: quorums } = useReadContracts({
    contracts: proposals.map(proposal => ({
      ...governor,
      functionName: 'quorum',
      args: [BigInt(proposal.blockNumber)],
    })),
  }) as { data?: Array<{ result: bigint }> }

  return useMemo(
    () =>
      (quorums ?? []).map(({ result: quorumAtSnapshot }, i) => {
        const [, forVote, abstainVote] = proposalVotes?.[i]?.result?.map(vote => formatEther(vote)) ?? []
        const votes = sumVotes([forVote, abstainVote])
        let quorum = '-'
        let percentage = 0

        if (quorumAtSnapshot !== 0n) {
          quorum = formatBalanceToHuman(quorumAtSnapshot)
          // Calculate percentage of votes relative to quorum
          percentage = (votes / Number(quorum)) * 100
        }

        // Determine the color based on percentage
        let colorClass = 'text-st-error' // Default to RED (0-49%)
        if (percentage >= 100) {
          colorClass = 'text-st-success'
        } else if (percentage >= 50) {
          colorClass = 'text-st-info'
        }
        const quorumToShow = Math.floor(Number(quorum))
        const percentageToShow = Math.floor(percentage)

        return {
          votes: {
            votes,
            colorClass,
            quorumToShow,
            percentageToShow,
          },
        }
      }),
    [quorums, proposalVotes],
  )
}

export type VotesColumnType = ReturnType<typeof useVotesColumn>[number]['votes']
