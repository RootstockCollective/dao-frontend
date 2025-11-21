'use client'

import { useGetTransactionHistory } from '../../hooks/useGetTransactionHistory'
import { useTableActionsContext, useTableContext, usePricesContext } from '@/shared/context'
import { useEffect, useMemo, useState, useRef } from 'react'
import {
  ColumnId,
  DEFAULT_HEADERS,
  PAGE_SIZE,
  TransactionHistoryCellDataMap,
} from './TransactionHistoryTable.config'
import { DesktopTransactionHistory } from './DesktopTransactionHistory'
import { convertDataToRowData } from './convertDataToRowData'
import { useCycleContext } from '@/app/collective-rewards/metrics/context'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { TransactionHistoryFilterSideBar } from '../TransactionHistoryFilterSideBar'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { ActiveFilter } from '@/components/FilterSideBar/types'
import { FilterButton } from '@/app/proposals/components/filter/FilterButton'

const COLUMN_TO_DB_FIELD: Partial<Record<ColumnId, string>> = {
  cycle: 'cycleStart',
  date: 'blockTimestamp',
  type: 'type',
  total_amount: 'blockTimestamp', // Use timestamp as fallback since total is calculated
}

export default function TransactionHistoryTable() {
  const isDesktop = useIsDesktop()
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const { rows, sort } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, TransactionHistoryCellDataMap>()
  const { prices } = usePricesContext()
  const {
    data: { cycleDuration },
  } = useCycleContext()
  const { getBuilderByAddress } = useBuilderContext()

  // Filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const filterSidebarRef = useRef<HTMLDivElement>(null)

  // Only apply click outside on desktop - mobile uses Modal component
  useClickOutside(filterSidebarRef, () => isDesktop && setIsFilterSidebarOpen(false))

  // Map sort columnId to database field
  const sortBy = sort?.columnId ? COLUMN_TO_DB_FIELD[sort.columnId] : 'blockTimestamp'
  const sortDirection = sort?.direction || 'desc'

  // Convert active filters to API format
  const apiFilters = useMemo(() => {
    const filter = (activeFilters: ActiveFilter[], groupId: string) =>
      activeFilters.filter(f => f.groupId === groupId).map(f => f.option.value)
    return {
      type: filter(activeFilters, 'type'),
      builder: filter(activeFilters, 'builder'),
      rewardToken: filter(activeFilters, 'claim-token'),
    }
  }, [activeFilters])

  const { data, isLoading, error, count } = useGetTransactionHistory({
    page: 1,
    pageSize: pageEnd,
    sortBy,
    sortDirection,
    type: apiFilters.type,
    builder: apiFilters.builder,
    rewardToken: apiFilters.rewardToken,
  })

  const rowData = useMemo(() => {
    return convertDataToRowData(data, cycleDuration, prices, getBuilderByAddress)
  }, [data, cycleDuration, prices, getBuilderByAddress])

  // Filter handlers
  const handleFilterToggle = (groupId: string, option: { label: string; value: string }) => {
    setActiveFilters(prev => {
      if (groupId === 'type') {
        // Enforce single select: toggle selection, only allow one value for 'type'
        const exists = prev.some(f => f.groupId === groupId && f.option.value === option.value)
        if (exists) {
          // Unselect (clear)
          return prev.filter(f => f.groupId !== groupId)
        }
        // Set new value, remove any previous type filter
        return [...prev.filter(f => f.groupId !== groupId), { groupId, option }]
      } else {
        // Multi-select for other groups
        const exists = prev.some(f => f.groupId === groupId && f.option.value === option.value)
        if (exists) {
          return prev.filter(f => !(f.groupId === groupId && f.option.value === option.value))
        }
        return [...prev, { groupId, option }]
      }
    })
  }

  const handleClearGroup = (groupId: string) => {
    setActiveFilters(prev => prev.filter(f => f.groupId !== groupId))
  }

  const handleClearAll = () => {
    setActiveFilters([])
  }

  const hasActiveFilters = useMemo(() => activeFilters.length > 0, [activeFilters])

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
    <div className="w-full flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <Header variant="h3" className="m-0" data-testid="events-list-header">
          EVENTS LIST
        </Header>
        <FilterButton
          isOpen={isFilterSidebarOpen}
          setIsOpen={setIsFilterSidebarOpen}
          isFiltering={hasActiveFilters}
        />
      </div>

      <div className={cn('flex flex-row-reverse')}>
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
              onFilterToggle={handleFilterToggle}
              onClearGroup={handleClearGroup}
              onClearAll={handleClearAll}
            />
          </div>
        </motion.div>
        <div className="grow overflow-y-auto">
          <DesktopTransactionHistory rows={rows} />
        </div>
      </div>

      <TablePager
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
