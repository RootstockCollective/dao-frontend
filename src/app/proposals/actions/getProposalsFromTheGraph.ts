import { fetchProposals, ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { buildProposal } from '@/app/proposals/actions/utils'

function transformGraphQLProposal(proposal: ProposalGraphQLResponse): ProposalApiResponse {
  return buildProposal(proposal, {
    parseTargets: targets => targets,
    parseCalldatas: calldatas => calldatas,
    proposerTransform: proposer => proposer.id,
  })
}

export async function getProposalsFromTheGraph(): Promise<ProposalApiResponse[]> {
  const { proposals } = await fetchProposals()
  return proposals.map(transformGraphQLProposal)
}
