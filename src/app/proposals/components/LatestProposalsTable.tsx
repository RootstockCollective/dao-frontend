'use client'
import { useMemo, memo, useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DebounceSearch } from '@/components/DebounceSearch'
import { FilterButton } from './filter/FilterButton'
import { ProposalsFilterSideBar } from './filter/ProposalsFilterSideBar'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { SearchButton } from './SearchButton'
import { Header } from '@/components/Typography'
import { Proposal, Milestones } from '@/app/proposals/shared/types'
import { useProposalFilters } from './filter/useProposalFilters'
import { ActiveFiltersDisplay } from './filter/ActiveFiltersDisplay'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useStickyHeader } from '@/shared/hooks'
import { FilterType, FilterItem } from './filter/types'
import { MILESTONE_SEPARATOR } from '../shared/utils'
import { ProposalState } from '@/shared/types/types'
import moment from 'moment'
import { ProposalsTable, ProposalsTableRef } from './ProposalsTableWithPagination'

/**
 * Filters proposals based on active filters
 * Handles search, category, status, and time filters
 */
const filterProposals = (proposals: Proposal[], activeFilters: FilterItem[]) => {
  return proposals.filter(proposal => {
    // Apply search filter
    const searchFilters = activeFilters.filter(f => f.type === FilterType.SEARCH)
    if (searchFilters.length > 0) {
      const searchMatch = searchFilters.some(searchFilter => {
        const lowered = searchFilter.value.toLowerCase()
        return [
          proposal.name,
          proposal.description,
          proposal.category,
          proposal.proposer,
          proposal.proposalId,
        ].some(param => param?.toLowerCase()?.includes(lowered))
      })
      if (!searchMatch) return false
    }

    // Apply category filters
    const categoryFilters = activeFilters.filter(f => f.type === FilterType.CATEGORY && f.value)
    if (categoryFilters.length > 0) {
      const categoryMatch = categoryFilters.some(categoryFilter => {
        const filterValue = categoryFilter.value

        // Special case for milestone-related filters - use exact pattern matching
        // consistent with category detection in getProposalCategoryFromParsedData
        if (filterValue.startsWith(MILESTONE_SEPARATOR)) {
          const isAllMilestonesFilter = filterValue === MILESTONE_SEPARATOR
          // "All milestones" matches M1lestone: followed immediately by valid milestone numbers
          // Specific milestone filters match exact pattern followed by whitespace or end
          const validMilestones = [Milestones.MILESTONE_1, Milestones.MILESTONE_2, Milestones.MILESTONE_3]
          const pattern = isAllMilestonesFilter
            ? `${MILESTONE_SEPARATOR}[${validMilestones.join('')}]`
            : `${filterValue}(?:\\s|$)`
          return new RegExp(pattern, 'i').test(proposal.description ?? '')
        }

        // For all other category filters, only check the category field
        return proposal.category?.toLowerCase()?.includes(filterValue.toLowerCase())
      })
      if (!categoryMatch) return false
    }

    // Apply status filters
    const statusFilters = activeFilters.filter(f => f.type === FilterType.STATUS && f.value)
    if (statusFilters.length > 0) {
      const statusMatch = statusFilters.some(statusFilter => {
        const status = statusFilter.value
        return (
          proposal.proposalState !== undefined &&
          ProposalState[proposal.proposalState]?.toLowerCase() === status.toLowerCase()
        )
      })
      if (!statusMatch) return false
    }

    // Apply time filters
    const timeFilters = activeFilters.filter(f => f.type === FilterType.TIME && f.value)
    if (timeFilters.length > 0) {
      const timeMatch = timeFilters.some(timeFilter => {
        const filterValue = timeFilter.value

        // Use proposal.Starts (moment object) for date-based filtering
        if (!proposal.Starts) return false

        const now = moment()
        const proposalDate = proposal.Starts

        switch (filterValue) {
          case 'last-week':
            return now.diff(proposalDate, 'days') <= 7
          case 'last-month':
            return now.diff(proposalDate, 'days') <= 30
          case 'last-90-days':
            return now.diff(proposalDate, 'days') <= 90
          case 'Wave 4':
          case 'Wave 5':
          case 'March-25':
            // For wave filters, check if the proposal name or description contains the wave
            return (
              proposal.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
              proposal.description?.toLowerCase().includes(filterValue.toLowerCase())
            )
          default:
            return true
        }
      })
      if (!timeMatch) return false
    }
    return true
  })
}

interface LatestProposalsTableProps {
  proposals: Proposal[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  const isDesktop = useIsDesktop()
  const proposalsTableRef = useRef<ProposalsTableRef>(null)

  // Sticky header hook - only enabled on mobile/tablet
  const { headerRef } = useStickyHeader({
    isEnabled: !isDesktop,
    style: {
      backgroundColor: 'var(--color-bg-80)',
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '1rem',
      paddingBottom: '1rem',
    },
    mode: 'position-based',
  })

  // Enhanced filtering system
  const { activeFilters, searchValue, setFilters, removeFilter, clearAllFilters, updateSearchValue } =
    useProposalFilters()

  // input field filtering
  const [searchVisible, setSearchVisible] = useState(isDesktop)
  const searchBoxRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useClickOutside(searchBoxRef, () => !isDesktop && setSearchVisible(false))

  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value)
      proposalsTableRef.current?.resetPagination()
    },
    [updateSearchValue],
  )

  // show searchfield focus on SearchButton click
  useEffect(() => {
    if (!searchVisible) return
    inputRef.current?.focus()
  }, [searchVisible])

  // filtering by category in sidebar
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const filterSidebarRef = useRef<HTMLDivElement>(null)
  // Only apply click outside on desktop - mobile uses Modal component
  useClickOutside(filterSidebarRef, () => isDesktop && setIsFilterSidebarOpen(false))

  const filteredProposalList = useMemo(() => {
    return filterProposals(proposals, activeFilters)
  }, [proposals, activeFilters])

  const hasSelectedFilters = useMemo(() => {
    return activeFilters.filter(f => !f.isAll && f.type !== FilterType.SEARCH).length > 0
  }, [activeFilters])

  return (
    <div className="py-4 px-6 rounded-sm bg-bg-80">
      <div ref={headerRef} className="mb-8 w-full">
        <div className="flex items-center gap-4">
          {(isDesktop || !searchVisible) && (
            <Header variant="h3" className="uppercase">
              Latest Proposals
            </Header>
          )}
          <div className="grow h-[50px] flex justify-end">
            <AnimatePresence>
              {searchVisible && (
                <motion.div
                  initial={{ opacity: 0, x: isDesktop ? 100 : 0 }}
                  animate={{ opacity: searchVisible ? 1 : 0, x: 0 }}
                  exit={{ opacity: 0, x: isDesktop ? 100 : 0 }}
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
          {(isDesktop || !searchVisible) && (
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
          )}
        </div>
        <ActiveFiltersDisplay
          activeFilters={activeFilters.filter(f => !f.isAll)}
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
            <ProposalsFilterSideBar
              isOpen={isFilterSidebarOpen}
              onClose={() => setIsFilterSidebarOpen(false)}
              activeFilters={activeFilters}
              onApplyFilters={setFilters}
            />
          </div>
        </motion.div>
        <div className="grow overflow-y-auto">
          {filteredProposalList.length > 0 ? (
            <ProposalsTable
              ref={proposalsTableRef}
              proposals={filteredProposalList}
              isFilterSidebarOpen={isFilterSidebarOpen}
            />
          ) : (
            <p data-testid="NoProposals">No proposals found &#x1F622;</p>
          )}
        </div>
      </div>
    </div>
  )
}
export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
