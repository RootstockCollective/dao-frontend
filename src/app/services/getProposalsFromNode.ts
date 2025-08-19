import Big from '@/lib/big'
import { parseEventLogs } from 'viem'
import { fetchProposalCreated } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import {
  EventArgumentsParameter,
  getProposalCategory,
  getProposalEventArguments,
  serializeBigInts,
} from '@/app/proposals/shared/utils'
import { ProposalApiResponse } from '@/app/proposals/shared/types'

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
    calldatasParsed: serializeBigInts(eventArgs.calldatasParsed),
  }
}

export async function getProposalsFromNode() {
  const data = await fetchProposalCreated(0)

  let proposals = parseEventLogs({
    abi: GovernorAbi,
    logs: data.data as any,
    eventName: 'ProposalCreated',
  })

  proposals = proposals
    .filter(
      (proposal, index, self) =>
        self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
    )
    // @ts-ignore
    .sort((a, b) => b.timeStamp - a.timeStamp)

  return proposals.map(transformEventLogProposal)
}
