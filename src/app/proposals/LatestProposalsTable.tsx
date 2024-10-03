import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { getEventArguments } from '@/app/proposals/shared/utils'
import { StatusColumn } from '@/app/proposals/StatusColumn'
import { Table } from '@/components/Table'
import { Header } from '@/components/Typography'
import { SharedProposalsTableContextProvider } from '@/app/proposals/SharedProposalsTableContext'
import { ProposalsContextProvider } from '@/app/proposals/ProposalsContext'
import { SentimentColumn } from '@/app/proposals/SentimentColumn'
import { VotesColumn } from '@/app/proposals/VotesColumn'
import { ProposalNameColumn } from '@/app/proposals/ProposalNameColumn'
import { ReactNode, useMemo } from 'react'
import { TimeRemainingColumn } from '@/app/proposals/TimeRemainingColumn'

interface LatestProposalsTableProps {
  latestProposals: ReturnType<typeof useFetchLatestProposals>['latestProposals']
}

const latestProposalsTransformer = (proposals: ReturnType<typeof getEventArguments>[]) =>
  proposals.map((proposal, i) => {
    // Create the withContext function to wrap components in ProposalsProvider
    const withContext = (component: ReactNode) => (
      <ProposalsContextProvider {...proposal} index={i}>
        {component}
      </ProposalsContextProvider>
    )
    return {
      'Proposal Name': withContext(<ProposalNameColumn />),
      'Current Votes': withContext(<VotesColumn />),
      Starts: proposal.Starts.format('YYYY-MM-DD'),
      'Time Remaining': withContext(<TimeRemainingColumn />),
      Sentiment: withContext(<SentimentColumn key={`${proposal.proposalId}_${i}`} />),
      Status: withContext(<StatusColumn />),
    }
  })

export const LatestProposalsTable = ({ latestProposals }: LatestProposalsTableProps) => {
  const latestProposalsMapped = useMemo(
    // @ts-ignore
    () => latestProposals.map(getEventArguments),
    [latestProposals.length],
  )

  return (
    <div>
      <Header variant="h2" className="mb-4">
        Latest Proposals
      </Header>
      {latestProposals.length > 0 && (
        <SharedProposalsTableContextProvider>
          <Table
            key={latestProposalsMapped.length}
            data={latestProposalsTransformer(latestProposalsMapped)}
            data-testid="TableProposals"
            tbodyProps={{
              'data-testid': 'TableProposalsTbody',
            }}
          />
        </SharedProposalsTableContextProvider>
      )}
    </div>
  )
}
