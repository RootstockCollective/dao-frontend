import { useMemo } from 'react'
import { useBlockNumber, useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { governor } from '@/lib/contracts'
import { type LatestProposalResponse } from './useFetchLatestProposals'
import { type EventArgumentsParameter, getEventArguments } from '../shared/utils'

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

interface Props {
  /**
   * Array of proposals returned by the backend API
   */
  proposals?: LatestProposalResponse[]
}

/**
 * The hook receives an array of fetched proposals from the backend API, connects to the
 * Governor smart contracts and queries proposal info functions. The hook acts as a middleware
 * between the backend and the user interface components collecting missing proposal properties.
 *
 * The hook should be used as a single source of truth for proposal list data
 */
export function useProposalListData({ proposals }: Props) {
  const { data: latestBlockNumber } = useBlockNumber()

  const { data: proposalVotes } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'proposalVotes',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: bigint[] }> }

  const { data: quorum } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'quorum',
      args: [BigInt(proposal.blockNumber)],
    })),
  }) as { data?: Array<{ result: bigint }> }

  const { data: proposalDeadline } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'proposalDeadline',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: string }> }

  const { data: state } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'state',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: bigint }> }

  return useMemo(
    () =>
      proposals?.map((proposal, i) => {
        const votes = proposalVotes?.[i]?.result?.map(vote => Math.round(+formatEther(vote)))
        const againstVotes = votes?.at(0) ?? 0
        const forVotes = votes?.at(1) ?? 0
        const abstainVotes = votes?.at(2) ?? 0
        const deadlineBlock = Number(proposalDeadline?.[i]?.result ?? 0n)
        const creationBlock = Number(proposal.blockNumber)
        const eventArgs = getEventArguments(proposal as unknown as EventArgumentsParameter)
        return {
          ...proposal,
          votes: {
            againstVotes,
            forVotes,
            abstainVotes,
            quorum: forVotes + abstainVotes,
          },
          blocksUntilClosure: deadlineBlock - Number(latestBlockNumber),
          votingPeriod: deadlineBlock - creationBlock,
          quorumAtSnapshot: Math.round(Number(formatEther(quorum?.[i].result ?? 0n))),
          proposalDeadline: Number(proposalDeadline?.[i].result ?? 0n),
          proposalState: ProposalState[Number(state?.[i].result ?? 0n)],
          ...eventArgs,
        }
      }) ?? [],
    [latestBlockNumber, proposalDeadline, proposalVotes, proposals, quorum, state],
  )
}

export type ProposalParams = ReturnType<typeof useProposalListData>[number]
