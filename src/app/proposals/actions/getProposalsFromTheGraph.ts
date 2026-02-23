import { getBlockNumber } from 'wagmi/actions'

import { fetchProposals, ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import { buildProposal } from '@/app/proposals/actions/utils'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { config } from '@/config'
import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'

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

/**
 * Rejects the proposals response if the subgraph block from `_meta` is too far behind
 * the latest on-chain block (`STATE_SYNC_BLOCK_STALENESS_THRESHOLD`).
 *
 * @param subgraphBlockNumber - Block number reported by the subgraph for the proposals query
 * @throws {Error} When the chain head cannot be read, or the subgraph is beyond the allowed lag
 */
async function validateSubgraphSyncFromMeta(subgraphBlockNumber: number): Promise<void> {
  const latestBlockNumber = await getBlockNumber(config)

  if (!latestBlockNumber) {
    throw new Error('The Graph: failed to fetch latest block number from blockchain')
  }

  const blockDifference = latestBlockNumber - BigInt(subgraphBlockNumber)

  if (blockDifference > BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD)) {
    throw new Error(
      `The Graph subgraph is lagging behind: subgraph block ${subgraphBlockNumber}, latest block ${latestBlockNumber}, difference ${blockDifference} blocks (threshold: ${STATE_SYNC_BLOCK_STALENESS_THRESHOLD})`,
    )
  }
}

export async function getProposalsFromTheGraph(): Promise<ProposalApiResponse[]> {
  try {
    const response = await fetchProposals()

    // Validate response structure
    if (!response) {
      throw new Error('The Graph returned null or undefined response')
    }

    if (!response._meta?.block?.number) {
      throw new Error('The Graph response is missing _meta block information')
    }

    await validateSubgraphSyncFromMeta(response._meta.block.number)

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
    if (error instanceof Error && error.message.includes('The Graph')) {
      throw error
    }
    // Wrap other errors (network errors, etc.)
    throw new Error(
      `Failed to fetch proposals from The Graph: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
