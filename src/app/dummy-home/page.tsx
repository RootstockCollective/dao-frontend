'use client'
import { useGetProposalsWithGraph } from '../proposals/hooks/useGetProposalsWithGraph'
import { LatestCollectiveSection } from '../user/latest-collective'

export default function DummyHome() {
  const { activeProposals } = useGetProposalsWithGraph()

  return (
    <div className="bg-bg-100 px-6">
      <LatestCollectiveSection proposal={activeProposals[0]} />
    </div>
  )
}
