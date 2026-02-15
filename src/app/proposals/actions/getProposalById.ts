import { unstable_cache } from 'next/cache'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { getCachedProposals } from './fetchAllProposals'

/**
 * Fetches a single proposal by ID using the cached proposals
 */
export async function getProposalById(proposalId: string): Promise<ProposalApiResponse | null> {
  const { proposals } = await getCachedProposals()
  return proposals.find(p => p.proposalId === proposalId) ?? null
}

/** Transforms the proposals list into a map keyed by proposalId for fast lookup */
async function transformProposalsIntoMap(): Promise<Record<string, string>> {
  const { proposals } = await getCachedProposals()
  return proposals.reduce(
    (acc, proposal) => ({ ...acc, [proposal.proposalId]: proposal.proposalId }),
    {} as Record<string, string>,
  )
}

const getCachedProposalsMap = unstable_cache(transformProposalsIntoMap, ['cached_proposals_map'], {
  revalidate: 30,
})

/** Checks whether a proposal with the given ID exists */
export async function confirmProposalExists(proposalId: string): Promise<boolean> {
  const proposals = await getCachedProposalsMap()
  return proposalId in proposals
}
