'use client'

import { useGetTransactionHistory } from '../hooks/useGetTransactionHistory'
import { useTableActionsContext, useTableContext, usePricesContext } from '@/shared/context'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useAccount } from 'wagmi'
import { ColumnId, DEFAULT_HEADERS, PAGE_SIZE, TransactionHistoryCellDataMap } from '../config'
import { DesktopTransactionHistory } from './desktop'
import { MobileTransactionHistory } from './mobile'
import { convertDataToRowData } from '../utils/convertDataToRowData'
import { useCycleContext } from '@/app/collective-rewards/metrics/context'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { TransactionHistoryFilterSideBar } from './TransactionHistoryFilterSideBar'
import { motion } from 'motion/react'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { useScrollLock } from '@/shared/hooks/useScrollLock'
import { ActiveFilter } from '@/components/FilterSideBar/types'
import { FilterButton } from '@/app/proposals/components/filter/FilterButton'
import { CsvButton } from './CsvButton'

const COLUMN_TO_DB_FIELD: Partial<Record<ColumnId, string>> = {
  cycle: 'cycleStart',
  date: 'blockTimestamp',
  type: 'type',
  total_amount: 'totalAmount',
}

/**
 * Main component for displaying transaction history.
 * Renders a table on desktop and an expandable list on mobile.
 * Includes filter sidebar and pager.
 */
export const TransactionHistoryTable = () => {
  const isDesktop = useIsDesktop()
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)
  const { rows, sort } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, TransactionHistoryCellDataMap>()
  const { prices } = usePricesContext()
  const {
    data: { cycleDuration },
  } = useCycleContext()
  const { getBuilderByAddress } = useBuilderContext()
  const { address } = useAccount()

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const filterSidebarRef = useRef<HTMLDivElement>(null)

  // Only lock scroll on mobile when filter modal is open
  useScrollLock(isFilterSidebarOpen && !isDesktop)

  // Only apply click outside on desktop - mobile uses Modal component
  useClickOutside(filterSidebarRef, () => isDesktop && setIsFilterSidebarOpen(false))

  // Map sort columnId to database field
  const sortBy = sort?.columnId ? COLUMN_TO_DB_FIELD[sort.columnId] : 'blockTimestamp'
  const sortDirection = sort?.direction || 'desc'

  // Convert active filters to API format
  const apiFilters = useMemo(() => {
    const filter = (groupId: string) =>
      activeFilters.filter(f => f.groupId === groupId).map(f => f.option.value)
    return {
      type: filter('type'),
      builder: filter('builder'),
      rewardToken: filter('claim-token'),
    }
  }, [activeFilters])

  const { data, isLoading, error, count } = useGetTransactionHistory({
    page: 1,
    pageSize: pageEnd,
    sortBy: sortBy,
    sortDirection: sortDirection,
    type: apiFilters.type,
    builder: apiFilters.builder,
    rewardToken: apiFilters.rewardToken,
  })

  const rowData = useMemo(() => {
    return convertDataToRowData(data, cycleDuration, prices, getBuilderByAddress)
  }, [data, cycleDuration, prices, getBuilderByAddress])

  const handleApplyFilters = (filters: ActiveFilter[]) => {
    setActiveFilters(filters)
  }

  const hasActiveFilters = useMemo(() => activeFilters.length > 0, [activeFilters])

  useEffect(() => {
    setPageEnd(PAGE_SIZE)
    setPagerKey(prev => prev + 1)
  }, [activeFilters])

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId: 'date', direction: 'desc' },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    dispatch({
      type: 'SET_ROWS',
      payload: rowData,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData])

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING',
      payload: isLoading || false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useEffect(() => {
    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      <div className="flex items-center justify-between">
        <Header variant="h3" className="m-0" data-testid="events-list-header">
          EVENTS LIST
        </Header>
        <div className="flex items-center gap-3">
          <CsvButton
            address={address}
            type={apiFilters.type}
            builder={apiFilters.builder}
            rewardToken={apiFilters.rewardToken}
            sortBy={sortBy}
            sortDirection={sortDirection}
            cycleDuration={cycleDuration}
            prices={prices}
            getBuilderByAddress={getBuilderByAddress}
          />
          <FilterButton
            isOpen={isFilterSidebarOpen}
            setIsOpen={setIsFilterSidebarOpen}
            isFiltering={hasActiveFilters}
          />
        </div>
      </div>

      <div className="flex flex-row-reverse">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isFilterSidebarOpen ? 264 : 0 }}
          className="overflow-hidden shrink-0"
        >
          {/* container for useClickOutside ref */}
          <div ref={filterSidebarRef} className="pl-2 h-full">
            <TransactionHistoryFilterSideBar
              isOpen={isFilterSidebarOpen}
              onClose={() => setIsFilterSidebarOpen(false)}
              activeFilters={activeFilters}
              onApply={handleApplyFilters}
            />
          </div>
        </motion.div>
        <div className="grow overflow-y-auto">
          {isDesktop ? <DesktopTransactionHistory rows={rows} /> : <MobileTransactionHistory rows={rows} />}
        </div>
      </div>

      <TablePager
        key={pagerKey}
        pageSize={PAGE_SIZE}
        totalItems={count}
        onPageChange={({ end }) => {
          setPageEnd(end)
        }}
        pagedItemName="events"
        mode="expandable"
      />
    </div>
  )
}
