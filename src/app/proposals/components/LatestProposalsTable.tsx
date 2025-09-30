'use client'
import { useMemo, memo, useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DebounceSearch } from '@/components/DebounceSearch'
import { FilterButton } from './filter/FilterButton'
import { FilterSideBar } from './filter/FilterSideBar'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { SearchButton } from './SearchButton'
import { Header } from '@/components/Typography'
import { Proposal } from '@/app/proposals/shared/types'
import { filterOptions } from './filter/filterOptions'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useStickyHeader } from '@/shared/hooks'
import { ActiveFiltersDisplay } from './filter/ActiveFiltersDisplay'
import { useProposalFilters } from './filter/useProposalFilters'
import { FilterType } from './filter/types'
import { ProposalsTable, type ProposalsTableRef } from './ProposalsTableWithPagination'

interface LatestProposalsTableProps {
  proposals: Proposal[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  const isDesktop = useIsDesktop()
  const proposalsTableRef = useRef<ProposalsTableRef>(null)

  // Sticky header hook - only enabled on mobile/tablet
  const { headerRef } = useStickyHeader({
    isEnabled: !isDesktop,
    backgroundColor: 'var(--color-bg-80)',
  })

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
  useClickOutside(filterSidebarRef, () => setIsFilterSidebarOpen(false))

  // Filters are grouped by type
  const filterGroups = useMemo(() => {
    const filtersByType = activeFilters.reduce(
      (acc, f) => {
        if (!acc[f.type]) acc[f.type] = []
        acc[f.type].push(f)
        return acc
      },
      {} as Record<FilterType, typeof activeFilters>,
    )

    return Object.values(filtersByType).filter(filters => filters.length > 0)
  }, [activeFilters])

  const filteredProposalList = useMemo(() => {
    return proposals.filter(proposal => {
      // Checks for at least one filter group to be true
      return filterGroups.every(filters => filters.some(f => f.validate(proposal)))
    })
  }, [proposals, filterGroups])

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
        {/* Active Filters Display */}
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
