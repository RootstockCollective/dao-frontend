import Big from '@/lib/big'
import {
  getProposalCategoryFromParsedData,
  getProposalEventArguments,
  serializeBigInts,
} from '@/app/proposals/shared/utils'
import { formatEther } from 'viem'

const ONE_ETHER = Big('1e18')

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
  const againstVotes = safeBig(proposal.votesAgainst).div(ONE_ETHER).round()
  const forVotes = safeBig(proposal.votesFor).div(ONE_ETHER).round()
  const abstainVotes = safeBig(proposal.votesAbstains).div(ONE_ETHER).round()
  const deadlineBlock = safeBig(proposal.voteEnd)
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
    quorumAtSnapshot: safeBig(formatEther(BigInt(proposal.quorum ?? 0n)))
      .round(undefined, Big.roundHalfEven)
      .toString(),
    proposalDeadline: deadlineBlock.toString(),
    proposalState: proposal.state,
    category,
    calldatasParsed: serializeBigInts(eventArgs.calldatasParsed),
    name: eventArgs.name,
    proposer: eventArgs.proposer,
    description: proposal.description,
    proposalId: eventArgs.proposalId,
    Starts: eventArgs.Starts.toISOString(),
    blockNumber: eventArgs.blockNumber,
  }
}

function safeBig(value: any, defaultValue: string | number = '0') {
  try {
    if (value === null || value === undefined || value === '') return Big(defaultValue)
    return Big(value)
  } catch {
    return Big(defaultValue)
  }
}
