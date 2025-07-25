'use client'
import { VotingPowerCard } from '@/app/delegate/components/VotingPowerContainer/VotingPowerCard'

export function ProposalsSummary({
  activeProposals,
  totalProposals,
}: {
  activeProposals: string
  totalProposals: string
}) {
  return (
    <>
      <div className="p-6 bg-bg-80 my-2">
        <div className="flex flex-col gap-[8px] sm:flex-row">
          <VotingPowerCard title="Total proposals" contentValue={totalProposals} />
        </div>
      </div>
    </>
  )
}
