import { useMemo } from 'react'
import { useBlockNumber } from 'wagmi'
import { Address, formatEther } from 'viem'
import { getEventArguments } from '../shared/utils'
import Big from '@/lib/big'
import { ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import { handleProposalState } from '@/lib/utils'

interface Props {
  /**
   * Array of proposals returned by the backend API
   */
  proposals: ProposalGraphQLResponse[]
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

  return useMemo(() => {
    return proposals?.map((proposal, i) => {
      const againstVotes = Big(proposal.votesAgainst).div(Big('1e18')).round()
      const forVotes = Big(proposal.votesFor).div(Big('1e18')).round()
      const abstainVotes = Big(proposal.votesAbstains).div(Big('1e18')).round()
      const deadlineBlock = Big(proposal.voteEnd)
      const creationBlock = Number(proposal.createdAtBlock)
      // @TODO this can be moved to server side
      const eventArgs = getEventArguments({
        args: {
          description: proposal.description,
          proposalId: BigInt(proposal.proposalId),
          proposer: proposal.proposer.id as Address,
          targets: proposal.targets,
          values: proposal.values as unknown as bigint[],
          calldatas: proposal.calldatas,
          voteStart: BigInt(proposal.voteStart),
          voteEnd: BigInt(proposal.voteEnd),
        },
        timeStamp: proposal.createdAt,
        blockNumber: proposal.createdAtBlock,
      })
      const { calldatasParsed } = eventArgs
      const category = calldatasParsed
        .filter(data => data.type === 'decoded')
        .find(data => ['withdraw', 'withdrawERC20'].includes(data.functionName))
        ? 'Grants'
        : 'Builder'
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
        quorumAtSnapshot: Big(formatEther(BigInt(proposal.quorum ?? 0n))).round(undefined, Big.roundHalfEven),
        proposalDeadline: deadlineBlock,
        proposalState: handleProposalState(proposal, latestBlockNumber ?? 0n),
        category,
        ...eventArgs,
      }
    })
  }, [latestBlockNumber, proposals])
}
