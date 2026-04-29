import { unstable_cache } from 'next/cache'

import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { logger } from '@/lib/logger'

import { getProposalsFromBlockscoutUncached } from './get-proposals-from-blockscout'

/**
 * Fetches all proposals from available sources with fallback.
 * Tries Envio, then DB, then GraphQL, then Blockscout — returns from the first source that succeeds.
 */
export async function fetchAllProposals(): Promise<{
  proposals: ProposalApiResponse[]
  sourceIndex: number
}> {
  const proposalsSources = [getProposalsFromBlockscoutUncached]

  for (const [i, proposalsSource] of proposalsSources.entries()) {
    try {
      const proposals = await proposalsSource()
      if (proposals.length > 0) {
        return { proposals, sourceIndex: i }
      }
      logger.error({ sourceIndex: i }, 'Proposals source returned empty array, trying next source')
    } catch (error) {
      logger.error({ err: error, sourceIndex: i }, 'Failed to fetch proposals from source')
    }
  }

  logger.error('All proposal sources failed or returned empty; returning empty proposals list')
  return { proposals: [], sourceIndex: -1 }
}

export const getCachedProposals = unstable_cache(fetchAllProposals, ['cached_all_proposals'], {
  revalidate: 30,
})
