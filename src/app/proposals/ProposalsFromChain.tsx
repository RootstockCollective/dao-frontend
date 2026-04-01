import { useMemo } from 'react'

import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { useProposalListData } from '@/app/proposals/hooks/useProposalListData'
import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'

import { useFetchAllProposals } from './hooks/useFetchLatestProposals'

export function ProposalsFromChain() {
  const { latestProposals } = useFetchAllProposals()
  const { data, totalProposals } = useProposalListData({
    proposals: latestProposals,
  })
  const memoizedProposals = useMemo(() => data, [data])
  return (
    <>
      <ProposalsSummary totalProposals={totalProposals.toString()} />
      <LatestProposalsTableMemoized proposals={memoizedProposals} />
    </>
  )
}
