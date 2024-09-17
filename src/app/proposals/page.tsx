'use client'
import { HeaderSection } from '@/app/proposals/HeaderSection'
import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { LatestProposalsTable } from '@/app/proposals/LatestProposalsTable'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { TxStatusMessage } from '@/components/TxStatusMessage/TxStatusMessage'
import { Paragraph, Span } from '@/components/Typography'
import { toFixed } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useVotingPower } from './hooks/useVotingPower'

export default function Proposals() {
  const { votingPower, canCreateProposal, threshold } = useVotingPower()
  const { latestProposals } = useFetchLatestProposals()

  return (
    <MainContainer>
      <TxStatusMessage messageType="proposal" />
      <HeaderSection createProposalDisabled={!canCreateProposal} threshold={threshold} />
      <div className="grid grid-rows-1 gap-[32px] mb-[100px]">
        <MetricsCard borderless title={<VotingPowerPopover />} amount={toFixed(votingPower)} />
        <div className="flex flex-row gap-x-6">
          {/*<MetricsCard title="Votes" amount="-" />*/}
          {/* @TODO ask product/design what this is */}
          {/* <MetricsCard title="Total voting power delegated" amount="230" /> */}
          <div className="w-52">
            <MetricsCard title="Proposals created" amount={latestProposals.length.toString()} />
          </div>
        </div>
        {/* <div className="grid grid-cols-2 gap-x-6">
          <DelegatedTable />
          <ReceivedDelegationTable />
        </div> */}
        <LatestProposalsTable latestProposals={latestProposals} />
      </div>
    </MainContainer>
  )
}

const PopoverContent = () => {
  const router = useRouter()
  return (
    <>
      <Paragraph size="small" className="font-bold mb-1">
        How is my voting power calculated?
      </Paragraph>
      <Paragraph size="small">
        Your voting power is determined by the amount of stRIF (staked RIF) you hold. To increase your voting
        power,{' '}
        <Span
          className="text-primary text-[14px] hover:underline cursor-pointer"
          onClick={() => router.push('/user?action=stake')}
        >
          stake RIF tokens now
        </Span>
        .
      </Paragraph>
    </>
  )
}

const VotingPowerPopover = () => (
  <Popover content={<PopoverContent />}>
    <button className="flex flex-row">
      <Paragraph>My voting power</Paragraph>
      <FaRegQuestionCircle className="ml-1" />
    </button>
  </Popover>
)
