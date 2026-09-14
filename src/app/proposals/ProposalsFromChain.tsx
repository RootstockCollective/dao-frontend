import { useMemo } from 'react'

import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { useProposalListData } from '@/app/proposals/hooks/useProposalListData'

import { useFetchAllProposals } from './hooks/useFetchLatestProposals'

export function ProposalsFromChain() {
  const { latestProposals } = useFetchAllProposals()
  const { data } = useProposalListData({
    proposals: latestProposals,
  })
  const memoizedProposals = useMemo(() => data, [data])
  return <LatestProposalsTableMemoized proposals={memoizedProposals} />
}
