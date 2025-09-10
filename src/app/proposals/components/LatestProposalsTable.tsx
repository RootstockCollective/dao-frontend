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
import Big from '@/lib/big'
import { GridTable } from '@/components/Table'
import { ProposalNameColumn, ProposerColumn } from './table-columns/ProposalNameColumn'
import { QuorumColumn, VotesColumn } from './table-columns/VotesColumn'
import { Countdown } from '@/components/Countdown'
import { DebounceSearch } from '@/components/DebounceSearch'
import { useSearchParams } from 'next/navigation'
import { FilterButton } from './filter/FilterButton'
import { FilterSideBar } from './filter/FilterSideBar'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { Status } from '@/components/Status'
import { SearchButton } from './SearchButton'
import { Category } from '../components/category'
import { Header, Paragraph } from '@/components/Typography'
import { Proposal } from '@/app/proposals/shared/types'
import { Pagination } from '@/components/Pagination'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useStickyHeader } from '@/shared/hooks'
import { ActiveFiltersDisplay } from './filter/ActiveFiltersDisplay'
import { useProposalFilters } from './filter/useProposalFilters'
import { FilterType } from './filter/types'
import { filterOptions } from './filter/filterOptions'

interface LatestProposalsTableProps {
  proposals: Proposal[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  const isDesktop = useIsDesktop()
  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])

  // Sticky header hook - only enabled on mobile/tablet
  const { headerRef } = useStickyHeader({
    isEnabled: !isDesktop,
    backgroundColor: 'var(--color-bg-80)',
  })

  const searchParams = useSearchParams()

  // Convert 1-indexed URL page to 0-indexed internal page
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
    pageSize: 10,
  }))
  const resetPagination = useCallback(() => setPagination(prev => ({ ...prev, pageIndex: 0 })), [])

  // Enhanced filtering system
  const { activeFilters, searchValue, addFilter, removeFilter, clearAllFilters, updateSearchValue } =
    useProposalFilters()

  // input field filtering
  const [searchVisible, setSearchVisible] = useState(false)
  const searchBoxRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useClickOutside(searchBoxRef, () => setSearchVisible(false))

  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value)
      resetPagination()
    },
    [updateSearchValue, resetPagination],
  )

  // show searchfield focus on SearchButton click
  useEffect(() => {
    if (!searchVisible) return
    inputRef.current?.focus()
  }, [searchVisible])

  // filtering by category in sidebar
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const filterSidebarRef = useRef<HTMLDivElement>(null)
  useClickOutside(filterSidebarRef, () => setIsFilterSidebarOpen(false))

  const filterGroups = useMemo(() => {
    const searchFilters = activeFilters.filter(f => f.type === FilterType.SEARCH)
    const categoryFilters = activeFilters.filter(f => f.type === FilterType.CATEGORY)
    const statusFilters = activeFilters.filter(f => f.type === FilterType.STATUS)
    const timeFilters = activeFilters.filter(f => f.type === FilterType.TIME)
    return [searchFilters, categoryFilters, statusFilters, timeFilters].filter(f => f.length > 0)
  }, [activeFilters])

  const filteredProposalList = useMemo(() => {
    return proposals.filter(proposal => {
      return filterGroups.every(filters => filters.some(f => f.validate(proposal)))
    })
  }, [proposals, filterGroups])

  const hasSelectedFilters = useMemo(() => {
    return activeFilters.filter(f => !f.exclusive && f.type !== FilterType.SEARCH).length > 0
  }, [activeFilters])

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
        const { proposalDeadline, blockNumber } = info.row.original
        return (
          <Countdown
            end={proposalDeadline}
            timeSource="blocks"
            referenceStart={Big(blockNumber)}
            colorDirection="normal"
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
          </div>
          <Paragraph variant="body-xs" className="text-text-40">
            {isFilterSidebarOpen ? 'reached' : 'needed | reached'}
          </Paragraph>
        </div>
      ),
      cell: ({ row }) => {
        const quorum = row.original.quorumAtSnapshot
        const { forVotes, abstainVotes } = row.original.votes
        return (
          <QuorumColumn
            quorumVotes={forVotes.add(abstainVotes)}
            quorumAtSnapshot={quorum}
            hideQuorumTarget={isFilterSidebarOpen}
          />
        )
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
      cell: ({ cell }) => <Category category={cell.getValue()} />,
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
      <div ref={headerRef} className="mb-8 w-full">
        <div className="flex items-center gap-4">
          <Header variant={'h3'} className={'uppercase'}>
            Latest Proposals
          </Header>
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
                isFiltering={activeFilters.some(f => f.type === FilterType.SEARCH)}
              />
            </motion.div>
            <FilterButton
              isOpen={isFilterSidebarOpen}
              setIsOpen={setIsFilterSidebarOpen}
              disabled={proposals.length === 0}
              isFiltering={hasSelectedFilters}
            />
          </div>
        </div>
        {/* Active Filters Display */}
        <ActiveFiltersDisplay
          activeFilters={activeFilters.filter(f => !f.exclusive)}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
        />
      </div>

      <div className={cn('flex flex-row-reverse mt-2')}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isFilterSidebarOpen ? 264 : 0 }}
          className="overflow-hidden shrink-0"
        >
          {/* container for useClickOutside ref */}
          <div ref={filterSidebarRef} className="pl-2 h-full">
            <FilterSideBar
              filterOptions={filterOptions}
              activeFilters={activeFilters}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
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
                data={filteredProposalList}
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
