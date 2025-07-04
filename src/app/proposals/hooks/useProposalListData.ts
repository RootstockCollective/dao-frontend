import { useMemo } from 'react'
import { useBlockNumber, useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { EventArgumentsParameter, getEventArguments } from '../shared/utils'
import Big from '@/lib/big'
import { LatestProposalResponse } from './useFetchLatestProposals'
import { governor } from '@/lib/contracts'
import { ProposalCategory, ProposalState } from '@/shared/types'

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

  const { data: state } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'state',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: bigint }> }

  return useMemo(() => {
    const proposalsResponse =
      proposals?.map((proposal, i) => {
        const votes = proposalVotes?.[i]?.result?.map(vote => Big(formatEther(vote)).round())
        const againstVotes = Big(votes?.at(0) ?? 0)
        const forVotes = Big(votes?.at(1) ?? 0)
        const abstainVotes = Big(votes?.at(2) ?? 0)
        const deadlineBlock = Big(proposal.args.voteEnd.toString())
        const creationBlock = Number(proposal.blockNumber)
        const eventArgs = getEventArguments(proposal as unknown as EventArgumentsParameter)
        const { calldatasParsed } = eventArgs
        const category = (
          calldatasParsed
            .filter(data => data.type === 'decoded')
            .find(data => ['withdraw', 'withdrawERC20'].includes(data.functionName))
            ? ProposalCategory.Grants
            : ProposalCategory.Builder
        ) as ProposalCategory
        return {
          ...proposal,
          votes: {
            againstVotes,
            forVotes,
            abstainVotes,
            quorum: forVotes.add(abstainVotes),
          },
          blocksUntilClosure: deadlineBlock.minus(latestBlockNumber?.toString() || 0),
          votingPeriod: deadlineBlock.minus(creationBlock),
          quorumAtSnapshot: Big(formatEther(quorum?.[i].result ?? 0n)).round(undefined, Big.roundHalfEven),
          proposalDeadline: deadlineBlock,
          proposalState: Big(state?.[i].result?.toString() ?? 0).toNumber() as ProposalState,
          category,
          ...eventArgs,
        }
      }) ?? []
    return {
      data: proposalsResponse,
      totalProposals: proposalsResponse.length,
      activeProposals: proposalsResponse.filter(p => ProposalState.Active == p.proposalState).length,
    }
  }, [latestBlockNumber, proposalVotes, proposals, quorum, state])
}
