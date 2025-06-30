'use client'
import { useMemo, memo, useState, useRef, useCallback, useEffect } from 'react'
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
import Big from 'big.js'
import { GridTable } from '@/components/Table'
import { ProposalNameColumn, ProposerColumn } from './table-columns/ProposalNameColumn'
import { QuorumColumn, VotesColumn } from './table-columns/VotesColumn'
import { TimeColumn } from './table-columns/TimeColumn'
import { DebounceSearch } from '@/components/DebounceSearch'
import { useSearchParams } from 'next/navigation'
import { FilterButton } from './filter/FilterButton'
import { FilterSideBar } from './filter/FilterSideBar'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { Status } from '@/components/Status'
import { SearchButton } from './SearchButton'
import { CategoryColumn } from './table-columns/CategoryColumn'
import { Paragraph } from '@/components/TypographyNew'
import Pagination from './pagination/Pagination'
import { Proposal } from '@/app/proposals/shared/types'
import { filterOptions } from './filter/filterOptions'

interface LatestProposalsTableProps {
  proposals: Proposal[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])

  const searchParams = useSearchParams()

  // Convert 1-indexed URL page to 0-indexed internal page
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
    pageSize: 10,
  }))
  const resetPagination = () => setPagination(prev => ({ ...prev, pageIndex: 0 }))

  // input field filtering
  const [searchVisible, setSearchVisible] = useState(false)
  const searchBoxRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useClickOutside(searchBoxRef, () => setSearchVisible(false))
  const [searchValue, setSearchValue] = useState('')
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    resetPagination()
  }, [])
  // show searchfield focus on SearchButton click
  useEffect(() => {
    if (!searchVisible) return
    inputRef.current?.focus()
  }, [searchVisible])

  // filtering by category in sidebar
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const filterSidebarRef = useRef<HTMLDivElement>(null)
  useClickOutside(filterSidebarRef, () => setIsFilterSidebarOpen(false))
  const [activeCategory, setActiveCategory] = useState('')
  const handleFilterToggle = useCallback((cat: string) => {
    setActiveCategory(cat)
    resetPagination()
  }, [])

  // filter all proposals
  const filteredProposalList = useMemo(() => {
    return proposals
      .filter(proposal =>
        activeCategory ? proposal.name?.toLowerCase()?.includes(activeCategory.toLowerCase()) : true,
      )
      .filter(proposal => {
        if (!searchValue) return true
        const lowered = searchValue.toLowerCase()
        return [
          proposal.name,
          proposal.description,
          proposal.category,
          proposal.proposer,
          proposal.proposalId,
        ].some(param => param.toLowerCase().includes(lowered))
      })
  }, [proposals, activeCategory, searchValue])

  // Table data definition helper
  const { accessor } = createColumnHelper<(typeof proposals)[number]>()
  // Table columns definition
  const columns = [
    accessor('name', {
      id: 'name',
      cell: ({ cell, row }) => (
        <ProposalNameColumn name={cell.getValue()} proposalId={row.original.proposalId} />
      ),
    }),
    accessor('proposer', {
      id: 'proposer',
      header: 'Proposal name',
      sortDescFirst: false,
      cell: ({ cell }) => <ProposerColumn by={cell.getValue()} />,
      sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
      meta: {
        width: '1.6fr',
      },
    }),
    accessor('Starts', {
      id: 'date',
      header: 'Date',
      sortDescFirst: false,
      cell: ({ cell }) => <Paragraph>{cell.getValue().format('MMM DD, YYYY')}</Paragraph>,
      meta: {
        width: '1.2fr',
      },
    }),
    accessor('blocksUntilClosure', {
      id: 'timeRemaining',
      header: 'Vote ending in',
      sortDescFirst: false,
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
      meta: {
        width: '1.32fr',
      },
    }),
    accessor('votes', {
      id: 'quorum',
      sortDescFirst: false,
      header: () => (
        <div>
          <div className="flex items-center-safe gap-1">
            <p className="mb-1">Quorum</p>
            {/* <KotoQuestionMarkIcon className="mb-1" /> */}
          </div>
          <p className="text-xs font-normal text-text-40">needed | reached</p>
        </div>
      ),
      cell: ({ row }) => {
        const quorum = row.original.quorumAtSnapshot
        const { forVotes, abstainVotes } = row.original.votes
        return <QuorumColumn quorumVotes={forVotes.add(abstainVotes)} quorumAtSnapshot={quorum} />
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
      meta: {
        width: '1.4fr',
      },
    }),
    accessor('votes', {
      id: 'votes',
      header: 'Votes',
      sortDescFirst: false,
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
        width: '1fr',
      },
    }),
    accessor('category', {
      id: 'propType',
      header: 'Type',
      sortDescFirst: false,
      meta: {
        width: '0.62fr',
      },
      cell: ({ cell }) => <CategoryColumn category={cell.getValue()} />,
    }),
    accessor('proposalState', {
      id: 'status',
      header: 'Status',
      sortDescFirst: false,
      cell: ({ cell }) => (
        <div className="w-full flex justify-center">
          <Status proposalState={cell.getValue()} />
        </div>
      ),
      meta: {
        width: '0.8fr',
      },
    }),
  ]

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
                className="w-full max-w-[650px]"
              >
                <DebounceSearch
                  placeholder="Search a proposal"
                  searchValue={searchValue}
                  onSearchSubmit={handleSearch}
                  ref={searchBoxRef}
                  inputRef={inputRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-end">
          <motion.div
            initial={{ width: 40, opacity: 1 }}
            animate={searchVisible ? { width: 0, opacity: 0 } : { width: 40, opacity: 1 }}
            className="flex items-center"
            style={{ pointerEvents: searchVisible ? 'none' : 'auto' }}
          >
            <SearchButton
              isOpen={searchVisible}
              setIsOpen={setSearchVisible}
              disabled={searchVisible}
              isFiltering={!!searchValue}
            />
          </motion.div>
          <FilterButton
            isOpen={isFilterSidebarOpen}
            setIsOpen={setIsFilterSidebarOpen}
            disabled={proposals.length === 0}
            isFiltering={!!activeCategory}
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
              currentFilter={activeCategory}
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
