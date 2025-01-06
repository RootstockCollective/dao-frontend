import { useMemo, memo, useState } from 'react'
import {
  createColumnHelper,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
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
import { Button } from '@/components/Button'

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

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  })
  // create table data model which is passed to the Table UI component
  const table = useReactTable({
    columns,
    data: filteredProposalList,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
  })

  return (
    <div>
      <HeaderTitle className="mb-4">Latest Proposals</HeaderTitle>
      <DebounceSearch placeholder="Search a proposal" onSearchSubmit={onSearchSubmit} />
      {filteredProposalList.length > 0 ? (
        <div>
          <StatefulTable
            equalColumns
            table={table}
            data-testid="TableProposals"
            tbodyProps={{
              'data-testid': 'TableProposalsTbody',
            }}
            className="overflow-visible"
          />

          <div className="flex justify-center space-x-2 mt-4">
            {/* Previous page button */}
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 bg-transparent"
            >
              &#x2329;
            </Button>

            {/* Page numbers */}
            {Array.from({ length: table.getPageCount() }).map((_, pageIndex) => (
              <Button
                key={pageIndex}
                onClick={() => table.setPageIndex(pageIndex)}
                disabled={table.getState().pagination.pageIndex === pageIndex}
                className={`${
                  table.getState().pagination.pageIndex === pageIndex ? 'bg-[#E56B1A]' : 'bg-transparent'
                } rounded-md px-4 py-2`}
              >
                {pageIndex + 1}
              </Button>
            ))}

            {/* Next page button */}
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-transparent px-4 py-2"
            >
              &#x232A;
            </Button>

            {/* Page size selector */}
            <select
              className="focus:outline-none focus:ring-0 focus:border-none hover:border-[#E56B1A] rounded-md bg-transparent hover:none text-[#E56B1A] hover:text-none "
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <Typography tagVariant="p" data-testid="NoProposals">
          No proposals found &#x1F622;
        </Typography>
      )}
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
