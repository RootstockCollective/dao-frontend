import { unstable_cache } from 'next/cache'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { getProposalsFromDB } from './getProposalsFromDB'
import { getProposalsFromTheGraph } from './getProposalsFromTheGraph'
import { getProposalsFromBlockscout } from './getProposalsFromBlockscout'

/**
 * Fetches all proposals from available sources with fallback.
 * Tries DB first, then GraphQL, then Blockscout — returns from the first source that succeeds.
 */
const SOURCE_NAMES = ['DB', 'TheGraph', 'Blockscout'] as const

export async function fetchAllProposals(): Promise<{
  proposals: ProposalApiResponse[]
  sourceIndex: number
}> {
  const proposalsSources = [getProposalsFromDB, getProposalsFromTheGraph, getProposalsFromBlockscout]

  for (let i = 0; i < proposalsSources.length; i++) {
    try {
      const proposals = await proposalsSources[i]()
      if (proposals.length > 0) {
        return { proposals, sourceIndex: i }
      }
    } catch (error) {
      console.error(`[Proposals] Source ${SOURCE_NAMES[i]} failed:`, error)
    }
  }

  return { proposals: [], sourceIndex: -1 }
}

export const getCachedProposals = unstable_cache(fetchAllProposals, ['cached_all_proposals'], {
  revalidate: 30,
})
