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
        Sentiment
      </Paragraph>
      <Paragraph variant="semibold" className="text-[12px]">
        For: {forVotes}
      </Paragraph>
      <Paragraph variant="semibold" className="text-[12px]">
        Against: {againstVotes}
      </Paragraph>
      <Paragraph variant="semibold" className="text-[12px]">
        Abstain: {abstainVotes}
      </Paragraph>
    </div>
  )
}

const SentimentColumn = ({ proposalId }: Omit<ProposalNameColumnProps, 'name'>) => {
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
      position="top"
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
  proposals.map(proposal => ({
    'Proposal Name': <ProposalNameColumn {...proposal} />,
    'Current Votes': <VotesColumn {...proposal} />,
    Starts: proposal.Starts,
    Sentiment: <SentimentColumn {...proposal} />,
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
