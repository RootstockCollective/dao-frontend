import { fetchProposals, ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { buildProposal } from '@/app/proposals/actions/utils'
import { sentryServer } from '@/lib/sentry/sentry-server'

function transformGraphQLProposal(proposal: ProposalGraphQLResponse): ProposalApiResponse {
  return buildProposal(proposal, {
    parseTargets: targets => targets,
    parseCalldatas: calldatas => calldatas,
    proposerTransform: proposer => (typeof proposer === 'string' ? proposer : proposer.id),
  })
}

function validateProposalStructure(proposal: ProposalGraphQLResponse, index: number): void {
  if (!proposal.proposalId) {
    throw new Error(`Proposal at index ${index} is missing proposalId`)
  }
  if (!proposal.proposer || !proposal.proposer.id) {
    throw new Error(`Proposal at index ${index} (ID: ${proposal.proposalId}) is missing proposer information`)
  }
  if (!Array.isArray(proposal.targets)) {
    throw new Error(`Proposal at index ${index} (ID: ${proposal.proposalId}) has invalid targets array`)
  }
  if (!Array.isArray(proposal.calldatas)) {
    throw new Error(`Proposal at index ${index} (ID: ${proposal.proposalId}) has invalid calldatas array`)
  }
  if (!Array.isArray(proposal.values)) {
    throw new Error(`Proposal at index ${index} (ID: ${proposal.proposalId}) has invalid values array`)
  }
}

export async function getProposalsFromTheGraph(): Promise<ProposalApiResponse[]> {
  try {
    const response = await fetchProposals()

    // Validate response structure
    if (!response) {
      throw new Error('The Graph returned null or undefined response')
    }

    if (!response.proposals) {
      throw new Error('The Graph response is missing proposals array')
    }

    if (!Array.isArray(response.proposals)) {
      throw new Error(
        `The Graph returned invalid proposals data: expected array, got ${typeof response.proposals}`,
      )
    }

    // Check minimum proposals count (similar to DB check)
    if (response.proposals.length < 10) {
      throw new Error(
        `Insufficient proposals from The Graph: expected at least 10, got ${response.proposals.length}`,
      )
    }

    // Validate each proposal structure before transformation
    response.proposals.forEach((proposal, index) => {
      validateProposalStructure(proposal, index)
    })

    // Transform proposals
    return response.proposals.map(transformGraphQLProposal)
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    sentryServer.captureException(errorObj, {
      tags: {
        errorType: 'PROPOSALS_THE_GRAPH_ERROR',
      },
    })
    // Re-throw with more context if it's already our error
    if (error instanceof Error && error.message.includes('The Graph')) {
      throw error
    }
    // Wrap other errors (network errors, etc.)
    throw new Error(
      `Failed to fetch proposals from The Graph: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
