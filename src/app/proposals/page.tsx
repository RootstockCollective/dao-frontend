'use client'
import { HeaderSection } from '@/app/proposals/HeaderSection'
import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { LatestProposalsTable } from '@/app/proposals/LatestProposalsTable'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { toFixed } from '@/lib/utils'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useVotingPower } from './hooks/useVotingPower'
import { TxStatusMessage } from '@/components/TxStatusMessage/TxStatusMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Proposals() {
  const { votingPower, canCreateProposal, threshold } = useVotingPower()

  const { latestProposals, isLoading: isFetching } = useFetchLatestProposals()

  return (
    <MainContainer>
      <TxStatusMessage messageType="proposal" />
      <HeaderSection createProposalDisabled={!canCreateProposal} threshold={threshold} />
      <div className="grid grid-rows-1 gap-[32px] mb-[100px]">
        <MetricsCard borderless title={<VotingPowerPopover />} amount={toFixed(votingPower)} />
        {isFetching ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-row gap-x-6">
              <MetricsCard title="Proposals created" amount={latestProposals.length.toString()} />
            </div>
            <LatestProposalsTable latestProposals={latestProposals} />
          </>
        )}
      </div>
    </MainContainer>
  )
}

const PopoverContent = () => (
  <>
    <p className="text-[12px] font-bold mb-1">How is my voting power calculated?</p>
    <p className="text-[12px]">
      Your voting power is calculated as the number of tokens (votes) that have been delegated to you before
      the proposal became active. You can delegate your votes to yourself, or to someone else. Others can also
      delegate their votes to you.
    </p>
  </>
)

const VotingPowerPopover = () => (
  <Popover content={<PopoverContent />}>
    <button className="flex flex-row">
      <p>My voting power</p>
      <FaRegQuestionCircle className="ml-1" />
    </button>
  </Popover>
)
