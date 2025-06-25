import { useMemo, memo, useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  createColumnHelper,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
} from '@tanstack/react-table'
import { GridTable } from '@/components/Table'
import { ProposalNameColumn, ProposalByColumn } from './table-columns/ProposalNameColumn'
import { QuorumColumn, VotesColumn } from './table-columns/VotesColumn'
import { TimeColumn } from './table-columns/TimeColumn'
import { DebounceSearch } from '@/components/DebounceSearch'
import { useSearchParams } from 'next/navigation'
import { filterOptions } from './filter/filterOptions'
import { FilterButton } from './filter/FilterButton'
import { FilterSideBar } from './filter/FilterSideBar'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { splitCombinedName } from '../shared/utils'
import { Status } from '@/components/Status'
import { SearchIconKoto } from '@/components/Icons'
import { Tooltip } from '@/components/Tooltip'
import { CategoryColumn } from './table-columns/CategoryColumn'
import { KotoQuestionMarkIcon } from '@/components/Icons'
import { ProposalParams } from '../hooks/useProposalListData'
import { Paragraph } from '@/components/TypographyNew'
import Pagination from './pagination/Pagination'
import Big from 'big.js'

interface LatestProposalsTableProps {
  proposals: ProposalParams[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  // search textfield
  const [searchedProposal, setSearchedProposal] = useState('')
  const [searchVisible, setSearchVisible] = useState(false)
  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])

  // filter all proposals after user typed text in the search field
  const filteredProposalList = useMemo(
    () =>
      proposals.filter(({ name }) => {
        try {
          const proposalName = String(name).toLowerCase()
          return proposalName.includes(searchedProposal.toLowerCase())
        } catch (e) {
          return false
        }
      }),
    [proposals, searchedProposal],
  )

  // State for proposal quick filters
  const [activeFilter, setActiveFilter] = useState<number>(0)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const filterSidebarRef = useRef<HTMLDivElement>(null) // ref for useClickOutside
  const searchRef = useRef<HTMLDivElement>(null)
  // close filter sidebar when user clicks outside of it
  useClickOutside(filterSidebarRef, () => setIsFilterSidebarOpen(false))
  // Ref to store the clear function from DebounceSearch
  const clearSearchRef = useRef<() => void>(undefined)
  useClickOutside(searchRef, () => setSearchVisible(false))

  // Flag to prevent search updates during filter changes
  const isFilterChanging = useRef(false)

  // Handle filter button clicks
  const handleFilterToggle = (id: number) => {
    // Set flag to prevent search from interfering with filter change
    isFilterChanging.current = true
    setActiveFilter(id)
    setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to page 1
    if (id === 0) return setSearchedProposal('')
    const option = filterOptions.find(opt => opt.id === id)
    setSearchedProposal(option?.name ?? '')
  }

  // Effect to clear search input after filter state updates
  useEffect(() => {
    if (isFilterChanging.current) {
      clearSearchRef.current?.()
      isFilterChanging.current = false
    }
  }, [activeFilter, searchedProposal])

  // Handle search input changes
  const handleSearch = useCallback(
    (value: string) => {
      if (!value) {
        // Only clear search if no active filter
        if (!activeFilter) {
          setSearchedProposal('')
        }
        return
      }
      // Only update search and clear filter if not in middle of filter change
      if (!isFilterChanging.current) {
        setActiveFilter(0)
        setSearchedProposal(value)
        // Reset to page 1
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
      }
    },
    [activeFilter],
  )

  // Table data definition helper
  const { accessor } = createColumnHelper<(typeof proposals)[number]>()
  // Table columns definition
  const columns = [
    accessor('name', {
      id: 'name',
      cell: ({ cell, row }) => {
        const { proposalName } = splitCombinedName(cell.getValue())
        return <ProposalNameColumn name={proposalName} proposalId={row.original.proposalId} />
      },
    }),
    accessor('name', {
      id: 'builderName',
      header: 'Proposal name',
      cell: ({ cell }) => {
        const { builderName } = splitCombinedName(cell.getValue())
        return <ProposalByColumn by={builderName ?? 'unknown'} />
      },
    }),
    accessor('Starts', {
      id: 'date',
      header: 'Date',
      cell: ({ cell }) => <Paragraph>{cell.getValue().format('MMM DD, YYYY')}</Paragraph>,
    }),
    accessor('blocksUntilClosure', {
      id: 'timeRemaining',
      header: 'Vote ending in',
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
      sortingFn: (a, b) => {
        return a.original.blocksUntilClosure.cmp(b.original.blocksUntilClosure)
      },
    }),
    accessor('votes', {
      id: 'quorum',
      header: () => (
        <div>
          <div className="flex items-center-safe gap-1">
            <p className="mb-1">Quorum</p>
            <KotoQuestionMarkIcon className="mb-1" />
          </div>
          <p className="text-xs font-normal text-text-40">needed | reached</p>
        </div>
      ),
      cell: ({ cell, row }) => {
        const { quorum } = cell.getValue()
        return <QuorumColumn quorumVotes={quorum} quorumAtSnapshot={row.original.quorumAtSnapshot} />
      },
      sortingFn: (a, b) => {
        const getQuorumPercent = (quorum: Big, quorumAtSnapshot: Big) =>
          quorumAtSnapshot.eq(0)
            ? Big(0)
            : quorum.div(quorumAtSnapshot).mul(100).round(undefined, Big.roundHalfEven)
        const percentA = getQuorumPercent(a.original.votes.quorum, a.original.quorumAtSnapshot)
        const percentB = getQuorumPercent(b.original.votes.quorum, b.original.quorumAtSnapshot)
        return percentA.cmp(percentB)
      },
    }),
    accessor('votes', {
      id: 'votes',
      header: 'Votes',
      cell: ({ cell }) => {
        const { forVotes, abstainVotes, againstVotes } = cell.getValue()
        return (
          <VotesColumn
            forVotes={forVotes.toNumber()}
            againstVotes={againstVotes.toNumber()}
            abstainVotes={abstainVotes.toNumber()}
          />
        )
      },
      sortingFn: (a, b) => {
        const votesA = a.original.votes
        const votesB = b.original.votes
        const sumA = votesA.forVotes.add(votesA.againstVotes).add(votesA.abstainVotes)
        const sumB = votesB.forVotes.add(votesB.againstVotes).add(votesB.abstainVotes)
        return sumA.cmp(sumB)
      },
      meta: {
        width: '0.7fr',
      },
    }),
    accessor('category', {
      id: 'category',
      header: 'Cat.',
      meta: {
        width: '0.5fr',
      },
      cell: ({ cell }) => <CategoryColumn category={cell.getValue()} />,
    }),
    accessor('proposalState', {
      id: 'status',
      header: 'Status',
      cell: ({ cell }) => (
        <div className="flex justify-end">
          <Status proposalState={cell.getValue()} />
        </div>
      ),
      meta: {
        width: '70px',
      },
    }),
  ]

  const searchParams = useSearchParams()
  // Convert 1-indexed URL page to 0-indexed internal page
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
    pageSize: 10,
  }))
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
    <div className="py-4 px-6 rounded-sm bg-bg-80">
      <div className="mb-8 w-full flex items-center gap-4">
        <h2 className="font-kk-topo text-xl leading-tight uppercase tracking-wide">Latest Proposals</h2>
        <div className="grow h-[50px] flex justify-end">
          <AnimatePresence>
            {searchVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: searchVisible ? 1 : 0, x: 0 }}
                exit={{ opacity: 0 }}
                className="w-full  max-w-[776px]"
              >
                <DebounceSearch
                  placeholder="Search a proposal"
                  onSearchSubmit={handleSearch}
                  onClearHandler={handler => {
                    clearSearchRef.current = handler
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {!searchVisible && (
              <motion.div
                initial={{ x: 16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 16, opacity: 0 }}
                className="flex items-center"
              >
                <Tooltip text="Search proposals">
                  <button className="cursor-pointer" onClick={() => setSearchVisible(v => !v)}>
                    <SearchIconKoto className="scale-90" />
                  </button>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
          <FilterButton
            isOpen={isFilterSidebarOpen}
            setIsOpen={state => {
              setIsFilterSidebarOpen(state)
              if (state) {
                setSearchVisible(false)
              }
            }}
            disabled={proposals.length === 0}
            isFiltering={activeFilter > 0}
          />
        </div>
      </div>
      <div className={cn('flex flex-row-reverse')}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isFilterSidebarOpen ? 264 : 0 }}
          className="overflow-hidden shrink-0"
        >
          {/* container for useClickOutside ref */}
          <div ref={filterSidebarRef} className="pl-2 h-full">
            <FilterSideBar
              filterOptions={filterOptions}
              currentFilter={activeFilter}
              setCurrentFilter={handleFilterToggle}
            />
          </div>
        </motion.div>
        <div className="grow overflow-y-auto">
          {filteredProposalList.length > 0 ? (
            <div>
              <GridTable
                className="min-w-[600px]"
                aria-label="Proposal table"
                stackFirstColumn
                table={table}
                data-testid="TableProposals"
              />
              <Pagination
                pagination={pagination}
                setPagination={setPagination}
                proposals={filteredProposalList}
                table={table}
              />
            </div>
          ) : (
            <p data-testid="NoProposals">No proposals found &#x1F622;</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
