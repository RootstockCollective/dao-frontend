import { cacheLife } from 'next/cache'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { getProposalsFromDB } from './getProposalsFromDB'
import { getProposalsFromEnvio } from './getProposalsFromEnvio'
import { getProposalsFromTheGraph } from './getProposalsFromTheGraph'
import { getProposalsFromBlockscout } from './getProposalsFromBlockscout'

/**
 * Fetches all proposals from available sources with fallback.
 * Tries Envio, then DB, then GraphQL, then Blockscout — returns from the first source that succeeds.
 */
export async function fetchAllProposals(): Promise<{
  proposals: ProposalApiResponse[]
  sourceIndex: number
}> {
  const proposalsSources = [
    getProposalsFromEnvio,
    getProposalsFromDB,
    getProposalsFromTheGraph,
    getProposalsFromBlockscout,
  ]

  for (let i = 0; i < proposalsSources.length; i++) {
    try {
      const proposals = await proposalsSources[i]()
      if (proposals.length > 0) {
        return { proposals, sourceIndex: i }
      }
    } catch (error) {
      console.error(`Failed to fetch proposals from source:`, error)
    }
  }

  return { proposals: [], sourceIndex: -1 }
}

export async function getCachedProposals() {
  'use cache'
  cacheLife({ revalidate: 30 })
  return fetchAllProposals()
}
