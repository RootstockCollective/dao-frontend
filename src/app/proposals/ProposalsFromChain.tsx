import { useEffect, useMemo } from 'react'

import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { useProposalListData } from '@/app/proposals/hooks/useProposalListData'
import { ProposalCounts } from '@/app/proposals/shared/types'

import { useFetchAllProposals } from './hooks/useFetchLatestProposals'

interface ProposalsFromChainProps {
  onCountsChange?: (counts: ProposalCounts | null) => void
}

export function ProposalsFromChain({ onCountsChange }: ProposalsFromChainProps) {
  const { latestProposals, isLoading, isError } = useFetchAllProposals()
  const { data, totalProposals, activeProposals, isStateLoading, isStateError } = useProposalListData({
    proposals: latestProposals,
  })
  const memoizedProposals = useMemo(() => data, [data])

  useEffect(() => {
    if (!onCountsChange) return
    // A failed fetch leaves an empty list behind, which would read as "0 proposals". Report
    // nothing instead, so the banner keeps its placeholders.
    if (isLoading || isError) {
      onCountsChange(null)
      return
    }
    onCountsChange({
      total: totalProposals,
      active: isStateLoading || isStateError ? null : activeProposals,
    })
  }, [onCountsChange, isLoading, isError, totalProposals, activeProposals, isStateLoading, isStateError])

  useEffect(() => () => onCountsChange?.(null), [onCountsChange])

  return <LatestProposalsTableMemoized proposals={memoizedProposals} />
}
