'use client'
import { Button } from '@/components/Button'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { Status } from '@/components/Status'
import { Table } from '@/components/Table'
import { Header, Paragraph } from '@/components/Typography'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'
import { useVotingPower } from './hooks/useVotingPower'

export default function Proposals() {
  const { votingPower, canCreateProposal } = useVotingPower()
  return (
    <MainContainer>
      <HeaderSection createProposalDisabled={!canCreateProposal} />
      <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
        <MetricsSection votingPower={votingPower} />
        {/* <div className="grid grid-cols-2 gap-x-6">
          <DelegatedTable />
          <ReceivedDelegationTable />
        </div> */}
        <LatestProposalsTable />
      </div>
    </MainContainer>
  )
}

const HeaderSection = ({ createProposalDisabled = true }) => {
  const router = useRouter()

  return (
    <div className="flex flex-row justify-between container pl-4">
      <Paragraph className="font-semibold text-[18px]">My Governance</Paragraph>
      <div className="flex flex-row gap-x-6">
        <Button
          startIcon={<FaPlus />}
          onClick={() => router.push('/proposals/create')}
          disabled={createProposalDisabled}
        >
          Create Proposal
        </Button>
        <Button variant="secondary" disabled>
          Delegate
        </Button>
      </div>
    </div>
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

const MetricsSection = ({ votingPower = '-' }) => (
  <>
    <MetricsCard borderless title={<VotingPowerPopover />} amount={votingPower} />
    <div className="flex flex-row gap-x-6">
      <MetricsCard title="Votes" amount="-" />
      {/* <MetricsCard title="Total voting power delegated" amount="230" /> */}
      <MetricsCard title="Proposals created" amount="-" />
    </div>
  </>
)

const delegatedTableData = [
  {
    'Amount delegated': '0.00239 stRIF',
    Address: '0x333...444',
  },
  {
    'Amount delegated': '0.0009 stRIF',
    Address: '0x333...444',
  },
  {
    'Amount delegated': '0.00019 stRIF',
    Address: '0x333...444',
  },
]

const DelegatedTable = () => (
  <div>
    <Header variant="h2" className="mb-4">
      Delegated to
    </Header>
    <Table data={delegatedTableData} />
  </div>
)

const receivedDelegationData = [
  {
    'Amount delegated': '0.322239 stRIF',
    Address: '0x333...444',
  },
  {
    'Amount delegated': '0.00001 stRIF',
    Address: '0x333...444',
  },
  {
    'Amount delegated': '1.230023 stRIF',
    Address: '0x333...444',
  },
]

const ReceivedDelegationTable = () => (
  <div>
    <Header variant="h2" className="mb-4">
      Received Delegations
    </Header>
    <Table data={receivedDelegationData} />
  </div>
)

const latestProposalsData = (router: AppRouterInstance) => [
  {
    'Proposal name': <button onClick={() => router.push('/proposals/ID409')}>Crypto ipsum bitcoin</button>,
    'Current votes': '59 votes',
    Starts: 'June 22, 2024',
    Sentiment: (
      <ComparativeProgressBar
        values={[
          { value: 10, color: 'var(--st-success)' },
          { value: 10, color: 'var(--st-error)' },
          { value: 10, color: 'var(--st-info)' },
        ]}
      />
    ),
    Status: <Status severity="success" />,
  },
  {
    'Proposal name': <button onClick={() => router.push('/proposals/ID410')}>Crypto ipsum bitcoin</button>,
    'Current votes': '120 votes',
    Starts: 'June 22, 2024',
    Sentiment: (
      <ComparativeProgressBar
        values={[
          { value: 50, color: 'var(--st-success)' },
          { value: 50, color: 'var(--st-error)' },
        ]}
      />
    ),
    Status: <Status severity="rejected" />,
  },
  {
    'Proposal name': <button onClick={() => router.push('/proposals/ID411')}>Crypto ipsum bitcoin</button>,
    'Current votes': '1,230 votes',
    Starts: 'June 22, 2024',
    Sentiment: (
      <ComparativeProgressBar
        values={[
          { value: 10, color: 'var(--st-success)' },
          { value: 10, color: 'var(--st-error)' },
          { value: 109, color: 'var(--text-light)' },
        ]}
      />
    ),
    Status: <Status severity="in-progress" />,
  },
  {
    'Proposal name': <button onClick={() => router.push('/proposals/ID412')}>Crypto ipsum bitcoin</button>,
    'Current votes': '1,232,323 votes',
    Starts: 'June 22, 2024',
    Sentiment: (
      <ComparativeProgressBar
        values={[
          { value: 10, color: 'var(--st-success)' },
          { value: 10, color: 'var(--st-error)' },
        ]}
      />
    ),
    Status: <Status severity="canceled" />,
  },
]

const noneData = [
  {
    'Proposal Name': '',
    'Current Votes': '',
    Starts: '',
    Sentiment: '',
    Status: '',
  },
]

const LatestProposalsTable = () => {
  const router = useRouter()
  return (
    <div>
      <Header variant="h2" className="mb-4">
        Latest Proposals
      </Header>
      {/* <Table data={latestProposalsData(router)} /> */}
      <Table data={noneData} />
    </div>
  )
}
