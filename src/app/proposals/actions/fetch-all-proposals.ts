import { unstable_cache } from 'next/cache'

import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { logger } from '@/lib/logger'

import { getProposalsFromBlockscoutUncached } from './get-proposals-from-blockscout'

let activeRevalidations = 0

/**
 * Fetches all proposals from available sources with fallback.
 * Tries Envio, then DB, then GraphQL, then Blockscout — returns from the first source that succeeds.
 */
export async function fetchAllProposals(): Promise<{
  proposals: ProposalApiResponse[]
  sourceIndex: number
}> {
  activeRevalidations++
  const start = Date.now()
  logger.info({ activeRevalidations }, 'fetchAllProposals started')

  const proposalsSources = [getProposalsFromBlockscoutUncached]

  try {
    for (const [i, proposalsSource] of proposalsSources.entries()) {
      const sourceStart = Date.now()
      try {
        const proposals = await proposalsSource()
        const elapsedMs = Date.now() - sourceStart
        if (proposals.length > 0) {
          logger.info(
            { sourceIndex: i, proposals: proposals.length, elapsedMs },
            'Proposals source succeeded',
          )
          return { proposals, sourceIndex: i }
        }
        logger.error(
          { sourceIndex: i, elapsedMs },
          'Proposals source returned empty array, trying next source',
        )
      } catch (error) {
        logger.error(
          { err: error, sourceIndex: i, elapsedMs: Date.now() - sourceStart },
          'Failed to fetch proposals from source',
        )
      }
    }

    logger.error(
      { totalElapsedMs: Date.now() - start },
      'All proposal sources failed or returned empty; returning empty proposals list',
    )
    return { proposals: [], sourceIndex: -1 }
  } finally {
    activeRevalidations--
    logger.info({ activeRevalidations, totalElapsedMs: Date.now() - start }, 'fetchAllProposals completed')
  }
}

export const getCachedProposals = unstable_cache(fetchAllProposals, ['cached_all_proposals'], {
  revalidate: 30,
})
