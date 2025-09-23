import { db } from '@/lib/db'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { buildProposal } from '@/app/proposals/actions/utils'

function transformProposal(proposal: any): ProposalApiResponse {
  const parseBytea = (el: string) => Buffer.from(el.slice(2), 'hex').toString()

  return buildProposal(proposal, {
    parseTargets: targets => targets.map(parseBytea),
    parseCalldatas: calldatas => calldatas.map(parseBytea),
    proposerTransform: proposer => proposer,
  })
}

export async function getProposalsFromDB(): Promise<ProposalApiResponse[]> {
  const result = await db('Proposal')
    .select(
      'proposalId',
      'description',
      'votesFor',
      'votesAgainst',
      'votesAbstains',
      'voteEnd',
      'voteStart',
      'quorum',
      'rawState',
      'state',
      'proposer',
      db.raw('array_to_json(calldatas) as calldatas'),
      'values',
      'createdAtBlock',
      db.raw('array_to_json(targets) as targets'),
      'createdAt',
    )
    .orderBy('createdAtBlock', 'DESC')
    .limit(1000)
  return result.map(transformProposal)
}
