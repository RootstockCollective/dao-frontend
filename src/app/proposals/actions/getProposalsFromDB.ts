import { db } from '@/lib/db'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { buildProposal } from '@/app/proposals/actions/utils'
import { Address } from 'viem'

interface ProposalDBRow {
  proposalId: string
  description: string
  votesFor: string | null
  votesAgainst: string | null
  votesAbstains: string | null
  voteEnd: string
  voteStart: string
  quorum: string | null
  rawState: number | null
  state: string | null
  proposer: Address
  calldatas: string[]
  values: string[]
  createdAtBlock: string
  targets: string[]
  createdAt: string
}

function transformProposal(proposal: ProposalDBRow): ProposalApiResponse {
  const parseBytea = (el: string) => Buffer.from(el.slice(2), 'hex').toString()

  return buildProposal(proposal, {
    parseTargets: targets => targets.map(parseBytea),
    parseCalldatas: calldatas => calldatas.map(parseBytea),
    proposerTransform: proposer => (typeof proposer === 'string' ? proposer : proposer.id),
  })
}

export async function getProposalsFromDB(): Promise<ProposalApiResponse[]> {
  try {
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

    // Validate result structure
    if (!result) {
      throw new Error('Database query returned null or undefined result')
    }

    if (!Array.isArray(result)) {
      throw new Error(`Database query returned invalid data: expected array, got ${typeof result}`)
    }

    // Check minimum proposals count
    if (result.length < 10) {
      throw new Error(`Insufficient proposals from database: expected at least 10, got ${result.length}`)
    }

    // Transform proposals
    return result.map(transformProposal)
  } catch (error) {
    // Re-throw with more context if it's already our error
    if (error instanceof Error && error.message.includes('database')) {
      throw error
    }
    // Wrap database errors (connection errors, query errors, etc.)
    throw new Error(
      `Failed to fetch proposals from database: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
