import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { getEventArguments } from '@/app/proposals/shared/utils'
import { StatusColumn } from '@/app/proposals/StatusColumn'
import { Table } from '@/components/Table'
import { HeaderTitle } from '@/components/Typography'
import { SharedProposalsTableContextProvider } from '@/app/proposals/SharedProposalsTableContext'
import { ProposalsContextProvider } from '@/app/proposals/ProposalsContext'
import { SentimentColumn } from '@/app/proposals/SentimentColumn'
import { VotesColumn } from '@/app/proposals/VotesColumn'
import { ProposalNameColumn } from '@/app/proposals/ProposalNameColumn'
import { ReactNode, useMemo, memo } from 'react'
import { TimeRemainingColumn } from '@/app/proposals/TimeRemainingColumn'

interface LatestProposalsTableProps {
  latestProposals: ReturnType<typeof useFetchAllProposals>['latestProposals']
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
      Proposal: withContext(<ProposalNameColumn />),
      'Quorum Votes': withContext(<VotesColumn />),
      Date: proposal.Starts.format('MM-DD-YYYY'),
      'Time Remaining': withContext(<TimeRemainingColumn />),
      Sentiment: withContext(<SentimentColumn key={`${proposal.proposalId}_${i}`} />),
      Status: withContext(<StatusColumn />),
    }
  })

const LatestProposalsTable = ({ latestProposals }: LatestProposalsTableProps) => {
  const latestProposalsMapped = useMemo(
    // @ts-ignore
    () => latestProposals.map(getEventArguments),
    [latestProposals.length],
  )

  return (
    <div>
      <HeaderTitle className="mb-4">Latest Proposals</HeaderTitle>
      {latestProposals.length > 0 && (
        <SharedProposalsTableContextProvider>
          <Table
            key={latestProposalsMapped.length}
            data={latestProposalsTransformer(latestProposalsMapped)}
            data-testid="TableProposals"
            tbodyProps={{
              'data-testid': 'TableProposalsTbody',
            }}
            className="overflow-visible"
          />
        </SharedProposalsTableContextProvider>
      )}
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
