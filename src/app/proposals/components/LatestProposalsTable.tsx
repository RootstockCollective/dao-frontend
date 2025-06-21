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
import { type LatestProposalResponse } from '../hooks/useFetchLatestProposals'
import { GridTable } from '@/components/Table'
import { ProposalNameColumn, ProposalByColumn } from './table-columns/ProposalNameColumn'
import { VotesColumn } from './table-columns/VotesColumn'
import { TimeColumn } from './table-columns/TimeColumn'
import { DebounceSearch } from '@/components/DebounceSearch'
import { useProposalListData } from '../hooks/useProposalListData'
import { Button } from '@/components/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import Big from '@/lib/big'
import { ProposalState } from '@/shared/types'
import { filterOptions } from './filter/filterOptions'
import { FilterButton } from './filter/FilterButton'
import { FilterSideBar } from './filter/FilterSideBar'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { mockProposalListData } from './mockProposalData'
import { splitCombinedName } from '../shared/utils'
import { PizzaChart } from '@/components/PizzaChart'
import { Status } from '@/components/Status'
import { SearchIcon } from '@/components/Icons'
import { Tooltip } from '@/components/Tooltip'
import { CategoryColumn } from './table-columns/CategoryColumn'
import { KotoQuestionMarkIcon } from '@/components/Icons'

interface LatestProposalsTableProps {
  proposals: LatestProposalResponse[]
  onEmitActiveProposal?: (activeProposals: number) => void
}

const LatestProposalsTable = ({ proposals, onEmitActiveProposal }: LatestProposalsTableProps) => {
  // search textfield
  const [searchedProposal, setSearchedProposal] = useState('')
  const [searchVisible, setSearchVisible] = useState(false)
  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])
  // query all proposals parameters at the Governor after receiving proposal list
  /* const proposalListData = useProposalListData({ proposals }) */
  const proposalListData = mockProposalListData // mocked proposals
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

  useEffect(() => {
    if (onEmitActiveProposal) {
      onEmitActiveProposal(
        proposalListData.filter(proposal =>
          [ProposalState.Pending, ProposalState.Active].includes(proposal.proposalState),
        ).length || 0,
      )
    }
  }, [onEmitActiveProposal, proposalListData])

  // State for proposal quick filters
  const [activeFilter, setActiveFilter] = useState<number>(0)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const filterSidebarRef = useRef<HTMLDivElement>(null) // ref for useClickOutside
  // close filter sidebar when user clicks outside of it
  useClickOutside(filterSidebarRef, () => setIsFilterSidebarOpen(false))
  // Ref to store the clear function from DebounceSearch
  const clearSearchRef = useRef<() => void>(undefined)
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
  const { accessor, display } = createColumnHelper<(typeof proposalListData)[number]>()
  // Table columns definition
  const columns = [
    display({
      id: 'name',
      cell: info => (
        <ProposalNameColumn name={info.row.original.name} proposalId={info.row.original.proposalId} />
      ),
    }),
    accessor('name', {
      id: 'builderName',
      header: 'Proposal name',
      cell: ({ cell }) => {
        const { builderName, proposalName } = splitCombinedName(cell.getValue())
        return <ProposalByColumn by={builderName ?? proposalName.split(' ').at(0) ?? 'unknown'} />
      },
    }),
    accessor(row => row.Starts.unix(), {
      id: 'date',
      header: 'Date',
      cell: info => <p>{info.row.original.Starts.format('MMM DD, YYYY')}</p>,
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
    }),
    accessor('votes', {
      id: 'quorum',
      header: 'Quorum',
      cell: ({ cell, row }) => {
        const { forVotes, abstainVotes } = cell.getValue()
        return (
          <VotesColumn
            forVotes={forVotes}
            abstainVotes={abstainVotes}
            quorumAtSnapshot={row.original.quorumAtSnapshot}
          />
        )
      },
    }),
    accessor('votes', {
      id: 'votes',
      header: 'Votes',
      cell: info => {
        const { forVotes, abstainVotes, againstVotes } = info.row.original.votes
        return (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <p>{forVotes.add(abstainVotes).add(againstVotes).toNumber().toLocaleString('en-US')}</p>
            <PizzaChart
              segments={[
                { name: 'For', value: forVotes.toNumber() },
                { name: 'Abstain', value: abstainVotes.toNumber() },
                { name: 'Against', value: againstVotes.toNumber() },
              ]}
            />
          </div>
        )
      },
    }),
    accessor('category', {
      id: 'category',
      header: 'Cat.',
      meta: {
        width: '0.5fr',
      },
      cell: ({ cell }) => {
        const category = cell.getValue()
        return <CategoryColumn category={category} />
      },
    }),
    accessor('proposalState', {
      id: 'status',
      header: xxx => <div className="">Status</div>,
      cell: info => (
        <div className="flex justify-end">
          <Status proposalState={info.row.original.proposalState} />
        </div>
      ),
      meta: {
        width: '70px',
      },
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
              >
                <Tooltip text="Search proposals">
                  <button className="cursor-pointer" onClick={() => setSearchVisible(v => !v)}>
                    <SearchIcon size={16} />
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
            disabled={proposalListData.length === 0}
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
        <div className="grow">
          {filteredProposalList.length > 0 ? (
            <div>
              <GridTable
                aria-label="Proposal table"
                stackFirstColumn
                table={table}
                data-testid="TableProposals"
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
                      page === pagination.pageIndex
                        ? 'bg-[#E56B1A] text-white'
                        : 'bg-transparent text-[#E56B1A]'
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
                  className="focus:outline-hidden focus:ring-0 focus:border-none hover:border-[#E56B1A] rounded-md bg-transparent hover:none text-[#E56B1A] hover:text-none "
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
            <p data-testid="NoProposals">No proposals found &#x1F622;</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
