import { useFetchAllProposals } from './hooks/useFetchLatestProposals'
import { useMemo } from 'react'
import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'
import { useProposalListData } from '@/app/proposals/hooks/useProposalListData'

export function ProposalsFromChain() {
  const { latestProposals } = useFetchAllProposals()
  const { data, activeProposals, totalProposals } = useProposalListData({
    proposals: latestProposals,
  })
  const memoizedProposals = useMemo(() => data, [data])
  return (
    <>
      <ProposalsSummary
        totalProposals={totalProposals.toString()}
        activeProposals={activeProposals.toString()}
      />
      <LatestProposalsTableMemoized proposals={memoizedProposals} />
    </>
  )
}
