import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { getProposalsFromDB } from './getProposalsFromDB'
import { getProposalsFromTheGraph } from './getProposalsFromTheGraph'
import { getProposalsFromBlockscout } from './getProposalsFromBlockscout'

/**
 * Fetches a single proposal by ID from available sources
 * Tries DB first, then GraphQL, then Node
 */
export async function getProposalById(proposalId: string): Promise<ProposalApiResponse | null> {
  const proposalsSources = [getProposalsFromDB, getProposalsFromTheGraph, getProposalsFromBlockscout]

  for (const source of proposalsSources) {
    try {
      const proposals = await source()
      const proposal = proposals.find(p => p.proposalId === proposalId)
      if (proposal) {
        return proposal
      }
    } catch (error) {
      console.error(`Failed to fetch proposals from source:`, error)
      // Continue to next source
    }
  }

  return null
}
