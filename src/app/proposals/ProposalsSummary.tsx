'use client'
import { VotingPowerCard } from '@/app/delegate/components/VotingPowerContainer/VotingPowerCard'
import { NotConnectedContent } from '@/app/delegate/sections/VotingPowerSection/NotConnectedVotingPowerContainer'
import { useAccount } from 'wagmi'

export function ProposalsSummary({
  totalProposals,
}: {
  totalProposals: string
}) {
  const { isConnected } = useAccount()
  return (
    <>
      <div className="p-6 bg-bg-80 my-2">
        <div className="flex flex-col gap-[8px] sm:flex-row">
          {isConnected ? (
            <VotingPowerCard title="Total proposals" contentValue={totalProposals} />
          ) : (
            <VotingPowerCard title="Total proposals" contentValue={<NotConnectedContent />} />
          )}
        </div>
      </div>
    </>
  )
}
