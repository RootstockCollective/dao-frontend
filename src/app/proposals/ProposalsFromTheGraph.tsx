import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { useProposalsContext } from '@/app/proposals/context'
import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function ProposalsFromTheGraph() {
  const { proposals, loading, error, totalProposalCount, activeProposalCount } = useProposalsContext()

  if (error) {
    throw error
  }

  if (loading) {
    return <LoadingSpinner />
  }
  return (
    <>
      <ProposalsSummary
        activeProposalsCount={activeProposalCount}
        totalProposals={totalProposalCount.toString()}
      />
      <LatestProposalsTableMemoized proposals={proposals} />
    </>
  )
}
