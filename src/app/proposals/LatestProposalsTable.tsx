import { getEventArguments } from '@/app/proposals/shared/utils'
import { Header, Paragraph } from '@/components/Typography'
import { Table } from '@/components/Table'
import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { Link } from '@/components/Link'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useMemo } from 'react'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { StatusColumn } from '@/app/proposals/StatusColumn'
import { Popover } from '@/components/Popover'

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
  const votes = data.reduce((prev, next) => Number(next) + prev, 0)
  return <p>{votes.toString()}</p>
}

const PopoverSentiment = ({ votes }: { votes: string[] }) => {
  const [againstVotes, forVotes, abstainVotes] = votes
  return (
    <div className="text-black">
      <Paragraph variant="semibold" className="text-[12px] font-bold mb-1">
        Votes for
      </Paragraph>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/3 text-st-success">
          For
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-2/3">
          {forVotes}
        </Paragraph>
      </div>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/3 text-st-error">
          Against
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-2/3">
          {againstVotes}
        </Paragraph>
      </div>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/3 text-st-info">
          Abstain
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-2/3">
          {abstainVotes}
        </Paragraph>
      </div>
    </div>
  )
}

const SentimentColumn = ({
  proposalId,
  index,
}: Omit<ProposalNameColumnProps, 'name'> & { index: number }) => {
  const data = useGetProposalVotes(proposalId)

  const sentimentValues = useMemo(() => {
    const [againstVotes, forVotes, abstainVotes] = data
    return [
      { value: Number(forVotes), color: 'var(--st-success)' },
      { value: Number(againstVotes), color: 'var(--st-error)' },
      { value: Number(abstainVotes), color: 'var(--st-info)' },
    ]
  }, [data])

  return (
    <Popover
      content={<PopoverSentiment votes={data} />}
      trigger="hover"
      background="light"
      position={index === 0 ? 'bottom' : 'top'}
      size="small"
    >
      <ComparativeProgressBar values={sentimentValues} />
    </Popover>
  )
}

interface LatestProposalsTableProps {
  latestProposals: ReturnType<typeof useFetchLatestProposals>['latestProposals']
}

const latestProposalsTransformer = (proposals: ReturnType<typeof getEventArguments>[]) =>
  proposals.map((proposal, i) => ({
    'Proposal Name': <ProposalNameColumn {...proposal} />,
    'Current Votes': <VotesColumn {...proposal} />,
    Starts: proposal.Starts,
    Sentiment: <SentimentColumn {...proposal} index={i} />,
    Status: <StatusColumn {...proposal} />,
  }))

export const LatestProposalsTable = ({ latestProposals }: LatestProposalsTableProps) => {
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
