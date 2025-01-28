import { useMemo, memo, useState, useEffect, useCallback } from 'react'
import {
  createColumnHelper,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
} from '@tanstack/react-table'
import { type LatestProposalResponse } from '../hooks/useFetchLatestProposals'
import { StatusColumn } from './table-columns/StatusColumn'
import { StatefulTable } from '@/components/Table'
import { HeaderTitle, Typography } from '@/components/Typography'
import { SentimentColumn } from './table-columns/SentimentColumn'
import { ProposalNameColumn } from './table-columns/ProposalNameColumn'
import { VotesColumn } from './table-columns/VotesColumn'
import { TimeColumn } from './table-columns/TimeColumn'
import { DebounceSearch } from '@/components/DebounceSearch'
import { useProposalListData } from '../hooks/useProposalListData'
import { Button } from '@/components/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import Big from '@/lib/big'
import { proposalQuickFilters } from '@/lib/constants'

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

  // State for proposal quick filters
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const handleFilterToggle = useCallback(
    (keyword: string) => () => {
      if (activeFilter === keyword) {
        // Reset both states if clicking active filter
        setActiveFilter(null)
        setSearchedProposal('')
      } else {
        // Set new filter if clicking different filter
        setActiveFilter(keyword)
        setSearchedProposal(keyword)
      }
    },
    [activeFilter],
  )

  const handleSearch = useCallback((value: string) => {
    setSearchedProposal(value)
    setActiveFilter(null)
  }, [])

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
            proposalBlockNumber={blockNumber}
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
          const maxCount = Big.max(againstVotes, forVotes, abstainVotes)
          if (maxCount === forVotes) return { type: 'for', count: maxCount, priority: 1 }
          if (maxCount === againstVotes) return { type: 'against', count: maxCount, priority: 2 }
          else return { type: 'abstain', count: maxCount, priority: 3 }
        }
        const dominantA = getDominantVoteType(rowA.original.votes)
        const dominantB = getDominantVoteType(rowB.original.votes)
        if (dominantA.type === dominantB.type) {
          return dominantB.count.minus(dominantA.count).toNumber()
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

  const router = useRouter()
  const searchParams = useSearchParams()

  // Convert 1-indexed URL page to 0-indexed internal page
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
    pageSize: 10,
  }))

  // Page validation
  useEffect(() => {
    const totalPages = Math.ceil(filteredProposalList.length / pagination.pageSize)
    const requestedPage = parseInt(searchParams?.get('page') ?? '1')

    if (requestedPage > totalPages || requestedPage < 1) {
      // Reset to page 1
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set('page', '1')
      router.replace(`?${params.toString()}`, { scroll: false })
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
  }, [searchParams, filteredProposalList.length, pagination.pageSize, router])

  // Update URL with 1-indexed page number
  useEffect(() => {
    if (!searchParams) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('page', (pagination.pageIndex + 1).toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [pagination.pageIndex, searchParams, router])

  const totalPages = Math.ceil(filteredProposalList.length / pagination.pageSize) // Calculate total pages based on the filtered proposal list and page size

  const maxPageButtons = 5 // Maximum number of page buttons to display
  const currentSetStart = Math.floor(pagination.pageIndex / maxPageButtons) * maxPageButtons
  const currentSetEnd = Math.min(currentSetStart + maxPageButtons, totalPages)

  // Generate page numbers to display
  const pageNumbers = Array.from(
    { length: currentSetEnd - currentSetStart },
    (_, index) => currentSetStart + index,
  )

  // Function to handle page navigation
  const goToPage = (pageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex }))
  }

  // Function to handle "..." button
  const goToNextSet = () => {
    goToPage(Math.min(currentSetStart + maxPageButtons, totalPages - 1))
  }

  const goToPrevSet = () => {
    goToPage(Math.max(currentSetStart - maxPageButtons, 0))
  }
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
    // Prevent pagination reset on data change
    autoResetPageIndex: false,
  })

  return (
    <div>
      <div className="flex justify-between">
        <HeaderTitle className="mb-4">Latest Proposals</HeaderTitle>
        <div className="flex gap-2">
          {proposalQuickFilters.map(keyword => (
            <Button
              key={keyword}
              className={`text-white text-sm font-thin border-[#e56b1a] hover:bg-[#e56b1a] h-[32px]
              ${activeFilter === keyword ? 'bg-[#e56b1a]' : 'bg-[#e56b1a] bg-opacity-40'}
              `}
              variant="secondary"
              onClick={handleFilterToggle(keyword)}
            >
              {keyword}
            </Button>
          ))}
        </div>
      </div>
      <DebounceSearch placeholder="Search a proposal" onSearchSubmit={handleSearch} />
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

            {/* Show "..." if there are pages before the current set */}
            {currentSetStart > 0 && (
              <Button onClick={goToPrevSet} className="bg-transparent">
                ...
              </Button>
            )}

            {/* Render Page Numbers */}
            {pageNumbers.map(page => (
              <Button
                key={page}
                onClick={() => goToPage(page)}
                className={`${
                  page === pagination.pageIndex ? 'bg-[#E56B1A] text-white' : 'bg-transparent text-[#E56B1A]'
                }`}
              >
                {page + 1} {/* Convert 0-based index to 1-based page numbers */}
              </Button>
            ))}

            {/* Show "..." if there are pages after the current set */}
            {currentSetEnd < totalPages && (
              <Button onClick={goToNextSet} className="bg-transparent">
                ...
              </Button>
            )}

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
