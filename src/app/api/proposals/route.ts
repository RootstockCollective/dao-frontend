import { getCachedProposals, ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import Big from '@/lib/big'
import { EventArgumentsParameter, getProposalEventArguments } from '@/app/proposals/shared/utils'
import { Address, parseEventLogs } from 'viem'
import { ProposalCategory } from '@/shared/types'
import { formatEther } from 'viem'
import { NextResponse } from 'next/server'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { fetchProposalCreated } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'

// Helper function to determine proposal category
function getProposalCategory(calldatasParsed: any[]): string {
  const hasWithdrawAction = calldatasParsed
    .filter(data => data.type === 'decoded')
    .find(data => ['withdraw', 'withdrawERC20'].includes(data.functionName))

  return hasWithdrawAction ? ProposalCategory.Grants : ProposalCategory.Activation
}

// Helper function to convert calldatasParsed to be JSON-serializable
function makeCalldatasSerializable(calldatasParsed: any[]) {
  return calldatasParsed.map(data => {
    if (data.type === 'decoded') {
      return {
        ...data,
        // Convert any BigInt values in args to strings
        args: data.args
          ? Object.fromEntries(
              Object.entries(data.args).map(([key, value]) => [
                key,
                typeof value === 'bigint' ? value.toString() : value,
              ]),
            )
          : data.args,
      }
    }
    // For fallback data, just return as is
    return data
  })
}

// Helper function to transform proposal data from GraphQL
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
    calldatasParsed: makeCalldatasSerializable(eventArgs.calldatasParsed),
    name: eventArgs.name,
    proposer: eventArgs.proposer,
    description: eventArgs.description,
    proposalId: eventArgs.proposalId,
    Starts: eventArgs.Starts.toISOString(),
    blockNumber: eventArgs.blockNumber,
  }
}

// Helper function to transform proposal data from event logs
function transformEventLogProposal(proposal: any): ProposalApiResponse {
  const eventArgs = getProposalEventArguments(proposal as unknown as EventArgumentsParameter)
  const category = getProposalCategory(eventArgs.calldatasParsed)

  return {
    votingPeriod: Big(proposal.args.voteEnd.toString()).minus(Number(proposal.blockNumber)).toString(),
    proposalDeadline: proposal.args.voteEnd.toString(),
    category,
    proposer: proposal.args.proposer,
    description: proposal.args.description,
    proposalId: proposal.args.proposalId.toString(),
    blockNumber: proposal.blockNumber.toString(),
    name: eventArgs.name,
    Starts: eventArgs.Starts.toISOString(),
    calldatasParsed: makeCalldatasSerializable(eventArgs.calldatasParsed),
  }
}

// Helper function to fetch and process proposals from event logs
async function getProposalsFromEventLogs(): Promise<ProposalApiResponse[]> {
  const data = await fetchProposalCreated(0)

  let proposals = parseEventLogs({
    abi: GovernorAbi,
    logs: data.data as any,
    eventName: 'ProposalCreated',
  })

  // Remove duplicates and sort by timestamp
  proposals = proposals
    .filter(
      (proposal, index, self) =>
        self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
    )
    // @ts-ignore
    .sort((a, b) => b.timeStamp - a.timeStamp)

  return proposals.map(transformEventLogProposal)
}

export async function GET() {
  try {
    const { proposals } = await getCachedProposals()
    const proposalResponse: ProposalApiResponse[] = proposals.map(transformGraphQLProposal)
    return NextResponse.json(proposalResponse)
  } catch (error) {
    try {
      const proposalResponse = await getProposalsFromEventLogs()
      return NextResponse.json(proposalResponse)
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  }
}
