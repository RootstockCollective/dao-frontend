'use client'
import { HeaderSection } from '@/app/proposals/HeaderSection'
import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { LatestProposalsTableMemoized } from '@/app/proposals/LatestProposalsTable'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { TxStatusMessage } from '@/components/TxStatusMessage/TxStatusMessage'
import { Paragraph, Span } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useVotingPower } from './hooks/useVotingPower'
import { useMemo } from 'react'
import { formatNumberWithCommas } from '@/lib/utils'
import { useGovernorParams } from './hooks/useGovernorParams'

export default function Proposals() {
  const { totalVotingPower = BigInt(0), isConnected } = useVotingPower()
  const { threshold } = useGovernorParams()
  const { latestProposals } = useFetchAllProposals()

  const memoizedProposals = useMemo(() => latestProposals.slice(0, 5), [latestProposals])
  return (
    <MainContainer>
      <TxStatusMessage messageType="proposal" />
      <HeaderSection
        isConnected={isConnected}
        createProposalDisabled={!(totalVotingPower >= threshold)}
        threshold={threshold}
      />
      <div className="grid grid-rows-1 gap-[32px] mb-[100px]">
        <div>
          <VotingPowerPopover />
          <Paragraph className="text-[48px] text-primary tracking-[-0.96px]" fontFamily="kk-topo">
            {formatNumberWithCommas(totalVotingPower)}
          </Paragraph>
        </div>
        <div className="flex flex-row gap-x-6">
          {/*<MetricsCard title="Votes" amount="-" />*/}
          {/* @TODO ask product/design what this is */}
          {/* <MetricsCard title="Total voting power delegated" amount="230" /> */}
          <div className="w-[272px]">
            <MetricsCard title="Proposals created" amount={latestProposals.length.toString()} borderless />
          </div>
        </div>
        {/* <div className="grid grid-cols-2 gap-x-6">
          <DelegatedTable />
          <ReceivedDelegationTable />
        </div> */}
        <LatestProposalsTableMemoized proposals={memoizedProposals} />
      </div>
    </MainContainer>
  )
}

const PopoverContent = () => {
  const router = useRouter()
  return (
    <>
      <Paragraph size="small" className="font-bold mb-1" data-testid="PopoverTitle">
        How is my voting power calculated?
      </Paragraph>
      <Paragraph size="small" data-testid="PopoverContent">
        Your voting power is determined by the amount of stRIF (staked RIF) you hold, whether you have
        delegated this voting power to someone else, and also by someone else who may have delegated their
        voting power to you. <br /> <br /> To increase your voting power,{' '}
        <Span
          className="text-primary text-[14px] hover:underline cursor-pointer"
          onClick={() => router.push('/user?action=stake')}
          data-testid="PopoverLink"
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
      <Paragraph className="text[16px] font-[700]">My Voting Power</Paragraph>
      <FaRegQuestionCircle className="ml-1 self-center" data-testid="QuestionIcon" />
    </button>
  </Popover>
)
