import { useMemo, memo, useState } from 'react'
import {
  createColumnHelper,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type LatestProposalResponse } from './hooks/useFetchLatestProposals'
import { type EventArgumentsParameter, getEventArguments } from '@/app/proposals/shared/utils'
/* import { StatusColumn } from '@/app/proposals/StatusColumn' */
import { Table } from '@/components/Table'
import { HeaderTitle, Typography } from '@/components/Typography'
// import { SentimentColumn } from '@/app/proposals/SentimentColumn'
import { ProposalNameColumn } from '@/app/proposals/ProposalNameColumn'
// import { TimeRemainingColumn } from '@/app/proposals/TimeRemainingColumn'
import { VotesColumn } from './VotesColumn'
import { DebounceSearch } from '../../components/DebounceSearch/DebounceSearch'
import { useVotesColumn } from './hooks/useVotesColumn'
import { useTimeRemainingColumn } from './hooks/useTimeRemainingColumn'

interface LatestProposalsTableProps {
  latestProposals: LatestProposalResponse[]
}

/* const latestProposalsTransformer = (proposals: Array<ReturnType<typeof getEventArguments>>) =>
  proposals.map((proposal, i) => {
    const rawData: Record<string, any> = {}
    // Create the withContext function to wrap components in ProposalsProvider
    const withContext = (component: ReactElement) => (
      <ProposalsContextProvider {...proposal} index={i}>
        {cloneElement(component, {
          onRender: (value: any) => {
            const componentName = (component.type as any).name
            if (componentName) {
              rawData[componentName] = value
            }
          },
        })}
      </ProposalsContextProvider>
    )
    return {
      // raw: rawData,
      Proposal: withContext(<ProposalNameColumn />),
      // 'Quorum Votes': withContext(<VotesColumn />),
      Date: proposal.Starts.format('MM-DD-YYYY'),
      'Time Remaining': withContext(<TimeRemainingColumn />),
      Sentiment: withContext(<SentimentColumn key={`${proposal.proposalId}_${i}`} />),
      Status: withContext(<StatusColumn />),
    }
  }) */

const LatestProposalsTable = ({ latestProposals: proposals }: LatestProposalsTableProps) => {
  const [searchedProposal, setSearchedProposal] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  // Table columns data
  const votesColumn = useVotesColumn({ proposals })
  const timeData = useTimeRemainingColumn({ proposals })

  // collect all table columns data into one object before passing to the Table
  const proposalData = useMemo(() => {
    if (proposals?.length === 0) return []
    const proposalsWithEventArgs = proposals
      ?.map(proposal => getEventArguments(proposal as unknown as EventArgumentsParameter))
      .map((proposal, i) => ({
        ...proposal,
        ...votesColumn[i],
        ...timeData[i],
      }))

    const searchResultsProposals = proposalsWithEventArgs?.filter(({ name }) => {
      try {
        const proposalName = String(name).toLowerCase()
        return proposalName.includes(searchedProposal.toLowerCase())
      } catch (e) {
        return false
      }
    })

    return searchResultsProposals ?? []
  }, [proposals, searchedProposal, timeData, votesColumn])

  const onSearchSubmit = (searchValue: string) => {
    setSearchedProposal(searchValue)
  }

  // Table columns definition
  const columnHelper = createColumnHelper<(typeof proposalData)[number]>()
  const columns = [
    columnHelper.accessor(row => row.name, {
      id: 'name',
      header: 'Proposal',
      cell: info => (
        <ProposalNameColumn name={info.row.original.name} proposalId={info.row.original.proposalId} />
      ),
    }),
    columnHelper.accessor(row => row.votes.percentageToShow, {
      id: 'votes',
      header: 'Quorum Votes',
      cell: info => <VotesColumn column={info.row.original.votes} />,
    }),
    columnHelper.accessor(row => row.Starts.toDate(), {
      id: 'date',
      header: 'Date',
      cell: info => <Typography tagVariant="p">{info.row.original.Starts.format('MM-DD-YYYY')}</Typography>,
    }),
    columnHelper.accessor(row => row.time.timeRemainingSec, {
      id: 'timeRemaining',
      header: 'Time Remaining',
      cell: info => (
        <Typography tagVariant="p" className={info.row.original.time.colorClass}>
          {info.row.original.time.timeRemainingMsg}
        </Typography>
      ),
    }),
  ]
  const table = useReactTable({
    columns,
    data: proposalData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <HeaderTitle className="mb-4">Latest Proposals</HeaderTitle>
      <DebounceSearch placeholder="Search a proposal" onSearchSubmit={onSearchSubmit} />
      {proposalData.length > 0 ? (
        <Table
          table={table}
          data-testid="TableProposals"
          tbodyProps={{
            'data-testid': 'TableProposalsTbody',
          }}
          className="overflow-visible"
        />
      ) : (
        <Typography tagVariant="p" data-testid="NoProposals">
          No proposals found &#x1F622;
        </Typography>
      )}
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
