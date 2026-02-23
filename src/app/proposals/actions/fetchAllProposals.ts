import { unstable_cache } from 'next/cache'

import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { logger } from '@/lib/logger'

import { getProposalsFromBlockscout } from './getProposalsFromBlockscout'
import { getProposalsFromDB } from './getProposalsFromDB'
import { getProposalsFromEnvio } from './getProposalsFromEnvio'
import { getProposalsFromTheGraph } from './getProposalsFromTheGraph'

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

  for (const [i, proposalsSource] of proposalsSources.entries()) {
    try {
      const proposals = await proposalsSource()
      if (proposals.length > 0) {
        return { proposals, sourceIndex: i }
      }
    } catch (error) {
      logger.error({ err: error, sourceIndex: i }, 'Failed to fetch proposals from source')
    }
  }

  return { proposals: [], sourceIndex: -1 }
}

export const getCachedProposals = unstable_cache(fetchAllProposals, ['cached_all_proposals'], {
  revalidate: 30,
})
