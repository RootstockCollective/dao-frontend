import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'
import { useProposalsContext } from '@/app/proposals/context'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'

export function ProposalsFromTheGraph() {
  const { proposals, loading, error, totalProposalCount } = useProposalsContext()

  if (error) {
    throw error
  }

  if (loading) {
    return <LoadingSpinner />
  }
  return (
    <>
      <ProposalsSummary totalProposals={totalProposalCount.toString()} />
      <LatestProposalsTableMemoized proposals={proposals} />
    </>
  )
}
