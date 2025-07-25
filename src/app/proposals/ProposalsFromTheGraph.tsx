import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'
import { useGetProposalsWithGraph } from '@/app/proposals/hooks/useGetProposalsWithGraph'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'

export function ProposalsFromTheGraph() {
  const { data, loading, error, activeProposalCount, totalProposalCount } = useGetProposalsWithGraph()

  if (error) {
    throw error
  }

  if (loading) {
    return <LoadingSpinner />
  }
  return (
    <>
      <ProposalsSummary totalProposals={totalProposalCount.toString()} />
      <LatestProposalsTableMemoized proposals={data} />
    </>
  )
}
