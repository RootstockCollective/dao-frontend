import Big from 'big.js'
import { formatEther } from 'viem'
import { fetchProposals, ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import {
  getProposalEventArguments,
  getProposalCategory,
  serializeBigInts,
} from '@/app/proposals/shared/utils'

function transformGraphQLProposal(proposal: ProposalGraphQLResponse): ProposalApiResponse {
  const againstVotes = Big(proposal.votesAgainst).div(Big('1e18')).round()
  const forVotes = Big(proposal.votesFor).div(Big('1e18')).round()
  const abstainVotes = Big(proposal.votesAbstains).div(Big('1e18')).round()
  const deadlineBlock = Big(proposal.voteEnd)
  const creationBlock = Number(proposal.createdAtBlock)

  const eventArgs = getProposalEventArguments({
    args: {
      description: proposal.description,
      proposalId: BigInt(proposal.proposalId),
      proposer: proposal.proposer.id as `0x${string}`,
      targets: proposal.targets,
      values: proposal.values as unknown as bigint[],
      calldatas: proposal.calldatas,
      voteStart: BigInt(proposal.voteStart),
      voteEnd: BigInt(proposal.voteEnd),
    },
    timeStamp: proposal.createdAt,
    blockNumber: proposal.createdAtBlock,
  })

  const category = getProposalCategory(eventArgs.calldatasParsed)

  return {
    votes: {
      againstVotes: againstVotes.toString(),
      forVotes: forVotes.toString(),
      abstainVotes: abstainVotes.toString(),
      quorum: forVotes.add(abstainVotes).toString(),
    },
    votingPeriod: deadlineBlock.minus(creationBlock).toString(),
    quorumAtSnapshot: Big(formatEther(BigInt(proposal.quorum ?? 0n)))
      .round(undefined, Big.roundHalfEven)
      .toString(),
    proposalDeadline: deadlineBlock.toString(),
    proposalState: proposal.state,
    category,
    calldatasParsed: serializeBigInts(eventArgs.calldatasParsed),
    name: eventArgs.name,
    proposer: eventArgs.proposer,
    description: eventArgs.description,
    proposalId: eventArgs.proposalId,
    Starts: eventArgs.Starts.toISOString(),
    blockNumber: eventArgs.blockNumber,
  }
}

export async function getProposalsFromTheGraph(): Promise<ProposalApiResponse[]> {
  const { proposals } = await fetchProposals()
  return proposals.map(transformGraphQLProposal)
}
