import { useFetchAllProposals } from './hooks/useFetchLatestProposals'
import { useMemo, useState } from 'react'
import { HeaderTitle } from '@/components/Typography'
import { LatestProposalsTableMemoized } from '@/app/proposals/components/LatestProposalsTable'
import { ProposalsSummary } from '@/app/proposals/ProposalsSummary'

export function Proposals() {
  const { latestProposals } = useFetchAllProposals()
  const [activeProposals, setActiveProposals] = useState<number>(0)
  console.log('invoking this proposal')
  const memoizedProposals = useMemo(() => latestProposals, [latestProposals])
  return (
    <>
      <HeaderTitle className="pb-6 whitespace-nowrap">My Governance</HeaderTitle>
      <ProposalsSummary
        totalProposals={latestProposals.length.toString()}
        activeProposals={activeProposals.toString()}
      />
      <LatestProposalsTableMemoized
        onEmitActiveProposal={activeProposals => {
          setActiveProposals(activeProposals)
        }}
        proposals={memoizedProposals}
      />
    </>
  )
}

