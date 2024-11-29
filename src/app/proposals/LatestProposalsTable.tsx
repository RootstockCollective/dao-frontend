import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { EventArgumentsParameter, getEventArguments } from '@/app/proposals/shared/utils'
import { StatusColumn } from '@/app/proposals/StatusColumn'
import { Table } from '@/components/Table'
import { HeaderTitle, Typography } from '@/components/Typography'
import { SharedProposalsTableContextProvider } from '@/app/proposals/SharedProposalsTableContext'
import { ProposalsContextProvider } from '@/app/proposals/ProposalsContext'
import { SentimentColumn } from '@/app/proposals/SentimentColumn'
import { VotesColumn } from '@/app/proposals/VotesColumn'
import { ProposalNameColumn } from '@/app/proposals/ProposalNameColumn'
import { ReactNode, useMemo, memo, useState } from 'react'
import { TimeRemainingColumn } from '@/app/proposals/TimeRemainingColumn'
import { DebounceSearch } from '../../components/DebounceSearch/DebounceSearch'

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
  const [searchedProposal, setSearchedProposal] = useState('')

  const latestProposalsMapped = useMemo(() => {
    if (!latestProposals?.length) return []
    const proposalsWithEventArgs = latestProposals?.map(proposal =>
      getEventArguments(proposal as unknown as EventArgumentsParameter),
    )
    const parsedProposals = latestProposalsTransformer(proposalsWithEventArgs)
    const searchResultsProposals = parsedProposals?.filter(({ Proposal }) => {
      try {
        const proposalName = String(Proposal?.props?.name).toLowerCase()
        if (!proposalName) return false
        return proposalName.includes(searchedProposal.toLowerCase())
      } catch (e) {
        return false
      }
    })

    return searchResultsProposals ?? []
  }, [latestProposals, searchedProposal])

  const onSearchSubmit = (searchValue: string) => {
    setSearchedProposal(searchValue)
  }

  return (
    <div>
      <HeaderTitle className="mb-4">Latest Proposals</HeaderTitle>
      <DebounceSearch placeholder="Search a proposal" onSearchSubmit={onSearchSubmit} />
      {latestProposalsMapped.length > 0 ? (
        <SharedProposalsTableContextProvider>
          <Table
            key={latestProposalsMapped.length}
            data={latestProposalsMapped}
            data-testid="TableProposals"
            tbodyProps={{
              'data-testid': 'TableProposalsTbody',
            }}
            className="overflow-visible"
          />
        </SharedProposalsTableContextProvider>
      ) : (
        <Typography tagVariant="p">No proposals found &#x1F622;</Typography>
      )}
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
