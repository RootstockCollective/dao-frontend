import { HeaderTitle } from '@/components/Typography'
import { LatestProposalsTable } from '@/app/proposals/components/LatestProposalsTable'
import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'
import { useGetProposals } from '@/app/proposals/hooks/useGetProposals'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ProposalGraphQLTable } from '@/app/proposals/components/ProposalGraphQLTable'

export function ProposalsGraphQL({ onError }: { onError: () => void }) {
  const { data, loading, error, activeProposals, totalProposals } = useGetProposals()
  useEffect(() => {
    if (error) {
      onError()
    }
  }, [error, onError])
  if (loading || !data) {
    return <LoadingSpinner />
  }
  if (error) {
    return null
  }
  return (
    <>
      <HeaderTitle className="pb-6 whitespace-nowrap">My Governance</HeaderTitle>
      <ProposalsSummary
        totalProposals={totalProposals.toString()}
        activeProposals={activeProposals.toString()}
      />
      <ProposalGraphQLTable proposals={data.proposals} />
    </>
  )
}
