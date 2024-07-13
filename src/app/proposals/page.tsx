'use client'
import { Button } from '@/components/Button'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { Table } from '@/components/Table'
import { Header, Paragraph } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'
import { useProposal } from './hooks/useProposal'
import { useVotingPower } from './hooks/useVotingPower'
import { Link } from '@/components/Link'
import { useMemo } from 'react'
import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { getEventArguments } from '@/app/proposals/shared/utils'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'

export default function Proposals() {
  const { votingPower, canCreateProposal } = useVotingPower()
  const { proposalCount } = useProposal()
  return (
    <MainContainer>
      <HeaderSection createProposalDisabled={!canCreateProposal} />
      <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
        <MetricsCard borderless title={<VotingPowerPopover />} amount={votingPower} />
        <div className="flex flex-row gap-x-6">
          {/*<MetricsCard title="Votes" amount="-" />*/}
          {/* @TODO ask product/design what this is */}
          {/* <MetricsCard title="Total voting power delegated" amount="230" /> */}
          <MetricsCard title="Proposals created" amount={proposalCount.toString()} />
        </div>
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

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => (
  <Link href={`/proposals/${proposalId}`} target="_blank">
    {name}
  </Link>
)

const VotesColumn = ({ proposalId }: Omit<ProposalNameColumnProps, 'name'>) => {
  const data = useGetProposalVotes(proposalId)

  const votes = useMemo(() => {
    if (data?.length === 3) {
      return data.reduce((prev, next) => Number(next) + prev, 0)
    }
    return 0n
  }, [data])

  return <p>{votes.toString()}</p>
}

const SentimentColumn = ({ proposalId }: Omit<ProposalNameColumnProps, 'name'>) => {
  const data = useGetProposalVotes(proposalId)

  const sentimentValues = useMemo(() => {
    if (data?.length === 3) {
      const [againstVotes, forVotes, abstainVotes] = data
      return [
        { value: Number(forVotes), color: 'var(--st-success)' },
        { value: Number(againstVotes), color: 'var(--st-error)' },
        { value: Number(abstainVotes), color: 'var(--st-info)' },
      ]
    }
    return [{ value: 0, color: 'var(--st-info)' }]
  }, [data])

  return <ComparativeProgressBar values={sentimentValues} />
}

const latestProposalsTransformer = (proposals: ReturnType<typeof getEventArguments>[]) =>
  proposals.map(proposal => ({
    'Proposal Name': <ProposalNameColumn {...proposal} />,
    'Current Votes': <VotesColumn {...proposal} />,
    Starts: proposal.Starts,
    Sentiment: <SentimentColumn {...proposal} />,
  }))

const LatestProposalsTable = () => {
  const { latestProposals } = useFetchLatestProposals()
  // @ts-ignore
  const latestProposalsMapped = latestProposals.map(getEventArguments)

  return (
    <div>
      <Header variant="h2" className="mb-4">
        Latest Proposals
      </Header>
      {latestProposals.length > 0 && <Table data={latestProposalsTransformer(latestProposalsMapped)} />}
    </div>
  )
}
