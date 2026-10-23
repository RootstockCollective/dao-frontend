import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { useProposalsContext } from '@/app/proposals/context'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function ProposalsFromTheGraph() {
  const { proposals, loading, error } = useProposalsContext()

  if (error) {
    throw error
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return <LatestProposalsTableMemoized proposals={proposals} />
}
