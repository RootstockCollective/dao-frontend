import { useEffect, useMemo } from 'react'

import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { useProposalListData } from '@/app/proposals/hooks/useProposalListData'
import { ProposalCounts } from '@/app/proposals/shared/types'

import { useFetchAllProposals } from './hooks/useFetchLatestProposals'

interface ProposalsFromChainProps {
  onCountsChange?: (counts: ProposalCounts | null) => void
}

export function ProposalsFromChain({ onCountsChange }: ProposalsFromChainProps) {
  const { latestProposals, isLoading } = useFetchAllProposals()
  const { data, totalProposals, activeProposals, isStateLoading } = useProposalListData({
    proposals: latestProposals,
  })
  const memoizedProposals = useMemo(() => data, [data])

  useEffect(() => {
    if (!onCountsChange) return
    onCountsChange(
      isLoading ? null : { total: totalProposals, active: isStateLoading ? null : activeProposals },
    )
  }, [onCountsChange, isLoading, totalProposals, activeProposals, isStateLoading])

  useEffect(() => () => onCountsChange?.(null), [onCountsChange])

  return <LatestProposalsTableMemoized proposals={memoizedProposals} />
}
