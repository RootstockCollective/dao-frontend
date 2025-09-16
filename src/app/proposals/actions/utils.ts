import Big from '@/lib/big'
import {
  getProposalCategoryFromParsedData,
  getProposalEventArguments,
  serializeBigInts,
} from '@/app/proposals/shared/utils'
import { formatEther } from 'viem'
export function buildProposal(
  proposal: any,
  {
    parseTargets,
    parseCalldatas,
    proposerTransform,
  }: {
    parseTargets: (targets: any[]) => any[]
    parseCalldatas: (calldatas: any[]) => any[]
    proposerTransform: (proposer: any) => `0x${string}`
  },
) {
  const againstVotes = Big(proposal.votesAgainst).div(Big('1e18')).round()
  const forVotes = Big(proposal.votesFor).div(Big('1e18')).round()
  const abstainVotes = Big(proposal.votesAbstains).div(Big('1e18')).round()
  const deadlineBlock = Big(proposal.voteEnd)
  const creationBlock = Number(proposal.createdAtBlock)

  const eventArgs = getProposalEventArguments({
    args: {
      description: proposal.description,
      proposalId: BigInt(proposal.proposalId),
      proposer: proposerTransform(proposal.proposer),
      targets: parseTargets(proposal.targets),
      values: proposal.values.map((v: string) => (v ? BigInt(v) : 0n)),
      calldatas: parseCalldatas(proposal.calldatas),
      voteStart: BigInt(proposal.voteStart),
      voteEnd: BigInt(proposal.voteEnd),
    },
    timeStamp: proposal.createdAt,
    blockNumber: proposal.createdAtBlock,
  })
  const category = getProposalCategoryFromParsedData(eventArgs.calldatasParsed, proposal.description)

  return {
    votes: {
      againstVotes: againstVotes.toString(),
      forVotes: forVotes.toString(),
      abstainVotes: abstainVotes.toString(),
    },
    voteStart: proposal.voteStart,
    voteEnd: proposal.voteEnd,
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
