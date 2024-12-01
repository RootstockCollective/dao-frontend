import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { governor } from '@/lib/contracts'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { type LatestProposalResponse } from './useFetchLatestProposals'

interface Props {
  proposals?: LatestProposalResponse[]
}

/**
 * Get data for Votes column in Proposals table
 */
export function useVotesColumn({ proposals }: Props) {
  // reading votes cast for all proposals
  const { data: votesData } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'proposalVotes',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: bigint[] }> }

  // reading quorums for each proposal snapshot
  const { data: quorums } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'quorum',
      args: [BigInt(proposal.blockNumber)],
    })),
  }) as { data?: Array<{ result: bigint }> }

  return useMemo(
    () =>
      quorums?.map(({ result: quorumAtSnapshot }, i) => {
        const proposalVotes = votesData?.[i]?.result?.map(vote => formatEther(vote)).map(Number)
        const againstVotes = proposalVotes?.at(0) ?? 0
        const forVotes = proposalVotes?.at(1) ?? 0
        const abstainVotes = proposalVotes?.at(2) ?? 0
        // for quorum remove against votes - zero element
        const quorumVotes = forVotes + abstainVotes
        let quorum = '-'
        let percentage = 0

        if (quorumAtSnapshot !== 0n) {
          quorum = formatBalanceToHuman(quorumAtSnapshot)
          // Calculate percentage of votes relative to quorum
          percentage = (quorumVotes / Number(quorum)) * 100
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
            againstVotes,
            forVotes,
            abstainVotes,
            quorumVotes,
            colorClass,
            quorumToShow,
            percentageToShow,
          },
        }
      }) ?? [],
    [quorums, votesData],
  )
}

export type VotesColumnType = ReturnType<typeof useVotesColumn>[number]['votes']
