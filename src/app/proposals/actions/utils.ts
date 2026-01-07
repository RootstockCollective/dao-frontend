import Big from '@/lib/big'
import {
  getProposalCategoryFromParsedData,
  getProposalEventArguments,
  serializeBigInts,
} from '@/app/proposals/shared/utils'
import { formatEther } from 'viem'
import { BaseProposalInput, ProposalTransformFunctions } from '@/app/proposals/shared/types'

const ONE_ETHER = Big('1e18')

export function buildProposal(
  proposal: BaseProposalInput,
  { parseTargets, parseCalldatas, proposerTransform }: ProposalTransformFunctions,
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
    proposalState: proposal.state ?? undefined,
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

function safeBig(
  value: string | number | bigint | null | undefined,
  defaultValue: string | number = '0',
): Big {
  try {
    if (value === null || value === undefined || value === '') return Big(defaultValue)
    // Convert bigint to string for Big constructor
    if (typeof value === 'bigint') {
      return Big(value.toString())
    }
    // Big constructor can throw on invalid numeric strings (e.g., "not-a-number", "12.34.56")
    // The catch block ensures we always return a valid Big instance, falling back to default
    return Big(value)
  } catch {
    // Fallback to default value if Big constructor fails (invalid input from external sources)
    return Big(defaultValue)
  }
}
