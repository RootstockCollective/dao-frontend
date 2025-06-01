import { fetchCachedProposalsFromGraph, getBlockNumber } from '@/app/proposals/actions/proposalsAction'
import { ProposalsPresentation } from '@/app/proposals/ProposalsPresentation'
import { LatestProposalsTable } from '@/app/proposals/components/LatestProposalsTable'
import { HeaderTitle } from '@/components/Typography'
import { handleProposalState } from '@/lib/utils'

export default async function ProposalsPage() {
  const lastBlockNumber = await getBlockNumber()
  const proposalsData = await fetchCachedProposalsFromGraph()
  const activeProposals = proposalsData.proposals
    .map(proposal => {
      proposal.state = handleProposalState(proposal, lastBlockNumber)
      return proposal
    })
    .filter(proposal => proposal.state === 'Active').length
  return (
    <>
      <HeaderTitle className="pb-6 whitespace-nowrap">My Governance</HeaderTitle>
      <ProposalsPresentation
        totalProposals={proposalsData.counters.find(e => e.id === 'proposals')?.count || '0'}
        activeProposals={activeProposals.toString()}
      />
      <LatestProposalsTable proposals={proposalsData.proposals} />
    </>
  )
}
