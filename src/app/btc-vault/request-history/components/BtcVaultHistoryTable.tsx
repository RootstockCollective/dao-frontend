'use client'

import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { FilterButton } from '@/app/proposals/components/filter/FilterButton'
import type { ActiveFilter } from '@/components/FilterSideBar'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useTableActionsContext, useTableContext, withTableContext } from '@/shared/context'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { useRequestHistory } from '../../hooks/useRequestHistory/useRequestHistory'
import type { HistoryFilterParams } from '../../services/ui/types'
import { BtcVaultHistoryFilterSideBar } from './BtcVaultHistoryFilterSideBar'
import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'
import { DEFAULT_HEADERS, PAGE_SIZE } from './BtcVaultHistoryTable.config'
import { convertDataToRowData } from './convertDataToRowData'
import { DesktopBtcVaultHistory } from './DesktopBtcVaultHistory'
import { MobileBtcVaultHistory } from './MobileBtcVaultHistory'

function toHistoryFilters(activeFilters: ActiveFilter[]): HistoryFilterParams | undefined {
  if (!activeFilters.length) return undefined

  const valuesOf = (groupId: string) =>
    activeFilters.filter(f => f.groupId === groupId).map(f => f.option.value)

  const type = valuesOf('type') as HistoryFilterParams['type']
  const claimToken = valuesOf('claimToken') as HistoryFilterParams['claimToken']
  const status = valuesOf('status') as HistoryFilterParams['status']

  if (!type?.length && !claimToken?.length && !status?.length) return undefined

  return {
    ...(type?.length ? { type } : {}),
    ...(claimToken?.length ? { claimToken } : {}),
    ...(status?.length ? { status } : {}),
  }
}

function BtcVaultHistoryTableInner() {
  const isDesktop = useIsDesktop()
  const { address } = useAccount()
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)

  const { sort } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BtcVaultHistoryCellDataMap>()

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const filterSidebarRef = useRef<HTMLDivElement>(null)

  useClickOutside(filterSidebarRef, () => isDesktop && setIsFilterSidebarOpen(false))

  const historyFilters = useMemo(() => toHistoryFilters(activeFilters), [activeFilters])

  const sortDirection = sort?.direction || 'desc'

  const { data, isLoading, error } = useRequestHistory(
    address,
    { page: 1, limit: pageEnd, sortDirection },
    historyFilters,
  )

  const rowData = useMemo(() => convertDataToRowData(data?.rows), [data?.rows])

  const handleApplyFilters = useCallback((filters: ActiveFilter[]) => {
    setPageEnd(PAGE_SIZE)
    setPagerKey(prev => prev + 1)
    setActiveFilters(filters)
  }, [])

  const handleCloseFilterSidebar = useCallback(() => {
    setIsFilterSidebarOpen(false)
  }, [])

  const handlePageChange = useCallback(({ end }: { end: number }) => {
    setPageEnd(end)
  }, [])

  const hasActiveFilters = activeFilters.length > 0

  // Reacts to: mount. Provides column definitions and default sort (newest first) to TableContext.
  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: 'date', direction: 'desc' } })
  }, [dispatch])

  // Reacts to: rowData changing (query result or filter change). Pushes transformed rows into TableContext.
  useEffect(() => {
    dispatch({ type: 'SET_ROWS', payload: rowData })
  }, [dispatch, rowData])

  // Reacts to: isLoading toggling during query fetch. Lets child components show loading state.
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
  }, [dispatch, isLoading])

  // Reacts to: error from useRequestHistory query. Propagates to TableContext for error display.
  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }, [dispatch, error])

  return (
    <div className="w-full flex flex-col gap-6 md:gap-10">
      <div className="flex items-center justify-between">
        <Header variant="h3" className="m-0 text-lg md:text-xl" data-testid="BtcVaultHistoryListHeader">
          TRANSACTION HISTORY
        </Header>
        <FilterButton
          isOpen={isFilterSidebarOpen}
          setIsOpen={setIsFilterSidebarOpen}
          isFiltering={hasActiveFilters}
          data-testid="BtcVaultHistoryFilterButton"
        />
      </div>

      <div className={cn('flex flex-row-reverse')}>
        {isDesktop && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isFilterSidebarOpen ? 264 : 0 }}
            className="overflow-hidden shrink-0"
          >
            <div ref={filterSidebarRef} className="pl-2 h-full">
              <BtcVaultHistoryFilterSideBar
                isOpen={isFilterSidebarOpen}
                onClose={handleCloseFilterSidebar}
                activeFilters={activeFilters}
                onApply={handleApplyFilters}
              />
            </div>
          </motion.div>
        )}
        {isDesktop ? <DesktopBtcVaultHistory /> : <MobileBtcVaultHistory />}
      </div>

      {!isDesktop && (
        <BtcVaultHistoryFilterSideBar
          isOpen={isFilterSidebarOpen}
          onClose={handleCloseFilterSidebar}
          activeFilters={activeFilters}
          onApply={handleApplyFilters}
        />
      )}

      <TablePager
        key={pagerKey}
        pageSize={PAGE_SIZE}
        totalItems={data?.total ?? 0}
        onPageChange={handlePageChange}
        pagedItemName="requests"
        mode="expandable"
        data-testid="BtcVaultHistoryTablePager"
      />
    </div>
  )
}

export const BtcVaultHistoryTableWithContext = withTableContext<ColumnId, BtcVaultHistoryCellDataMap>(
  BtcVaultHistoryTableInner,
)
