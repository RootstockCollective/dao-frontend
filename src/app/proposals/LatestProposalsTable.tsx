import { useMemo, memo, useState } from 'react'
import {
  createColumnHelper,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type LatestProposalResponse } from './hooks/useFetchLatestProposals'
import { StatusColumn } from '@/app/proposals/table-columns/StatusColumn'
import { StatefulTable } from '@/components/Table'
import { HeaderTitle, Typography } from '@/components/Typography'
import { SentimentColumn } from '@/app/proposals/table-columns/SentimentColumn'
import { ProposalNameColumn } from '@/app/proposals/table-columns/ProposalNameColumn'
import { VotesColumn } from './table-columns/VotesColumn'
import { TimeColumn } from './table-columns/TimeColumn'
import { DebounceSearch } from '../../components/DebounceSearch/DebounceSearch'
import { useProposalListData } from './hooks/useProposalListData'

interface LatestProposalsTableProps {
  proposals: LatestProposalResponse[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  // search textfield
  const [searchedProposal, setSearchedProposal] = useState('')
  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])
  // query all proposals parameters at the Governor after receiving proposal list
  const proposalListData = useProposalListData({ proposals })
  // filter all proposals after user typed text in the search field
  const filteredProposalList = useMemo(
    () =>
      proposalListData.filter(({ name }) => {
        try {
          const proposalName = String(name).toLowerCase()
          return proposalName.includes(searchedProposal.toLowerCase())
        } catch (e) {
          return false
        }
      }),
    [proposalListData, searchedProposal],
  )

  const onSearchSubmit = (searchValue: string) => {
    setSearchedProposal(searchValue)
  }
  // Table data definition helper
  const { accessor } = createColumnHelper<(typeof proposalListData)[number]>()
  // Table columns definition
  const columns = [
    accessor('name', {
      id: 'name',
      header: 'Proposal',
      cell: info => (
        <ProposalNameColumn name={info.row.original.name} proposalId={info.row.original.proposalId} />
      ),
    }),
    accessor('votes.quorum', {
      id: 'votes',
      header: 'Quorum Votes',
      cell: info => {
        const { forVotes, abstainVotes } = info.row.original.votes
        return (
          <VotesColumn
            forVotes={forVotes}
            abstainVotes={abstainVotes}
            quorumAtSnapshot={info.row.original.quorumAtSnapshot}
          />
        )
      },
    }),
    accessor(row => row.Starts.unix(), {
      id: 'date',
      header: 'Date',
      cell: info => <Typography tagVariant="p">{info.row.original.Starts.format('MM-DD-YYYY')}</Typography>,
    }),
    accessor('blocksUntilClosure', {
      id: 'timeRemaining',
      header: 'Time Remaining',
      cell: info => {
        const { blocksUntilClosure, proposalDeadline, blockNumber } = info.row.original
        return (
          <TimeColumn
            blocksUntilClosure={blocksUntilClosure}
            proposalDeadline={proposalDeadline}
            proposalBlockNumber={Number(blockNumber)}
          />
        )
      },
    }),
    accessor(row => row.votes, {
      id: 'sentiment',
      header: 'Sentiment',
      cell: info => (
        <SentimentColumn
          index={info.row.index}
          againstVotes={info.row.original.votes?.againstVotes}
          forVotes={info.row.original.votes?.forVotes}
          abstainVotes={info.row.original.votes?.abstainVotes}
        />
      ),
      sortingFn: (rowA, rowB) => {
        const getDominantVoteType = (votesData: typeof rowA.original.votes) => {
          const { againstVotes, forVotes, abstainVotes } = votesData
          const maxCount = Math.max(againstVotes, forVotes, abstainVotes)
          if (maxCount === forVotes) return { type: 'for', count: maxCount, priority: 1 }
          if (maxCount === againstVotes) return { type: 'against', count: maxCount, priority: 2 }
          else return { type: 'abstain', count: maxCount, priority: 3 }
        }
        const dominantA = getDominantVoteType(rowA.original.votes)
        const dominantB = getDominantVoteType(rowB.original.votes)
        if (dominantA.type === dominantB.type) {
          return dominantB.count - dominantA.count
        }
        return dominantA.priority - dominantB.priority
      },
    }),
    accessor('proposalState', {
      id: 'status',
      header: 'Status',
      cell: info => <StatusColumn proposalState={info.row.original.proposalState} />,
    }),
  ]
  // create table data model which is passed to the Table UI component
  const table = useReactTable({
    columns,
    data: filteredProposalList,
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
      {filteredProposalList.length > 0 ? (
        <StatefulTable
          equalColumns
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
