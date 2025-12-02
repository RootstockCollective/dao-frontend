import { Header } from '@/components/Typography'
import { FilterButton } from '@/app/proposals/components/filter/FilterButton'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { TablePager } from '@/components/TableNew'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePricesContext, useTableActionsContext, useTableContext } from '@/shared/context'
import { ActiveFilter } from '@/components/FilterSideBar'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { DesktopStakingHistory } from '@/app/staking/components/DesktopStakingHistory'
import {
  ColumnId,
  DEFAULT_HEADERS,
  PAGE_SIZE,
  StakingHistoryCellDataMap,
} from '@/app/staking/components/StakingHistoryTable.config'
import { useGetStakingHistory } from '@/app/staking/hooks/useGetStakingHistory'
import { StakingHistoryFilterSideBar } from '@/app/staking/StakingHistoryFilterSideBar'
import { convertDataToRowData } from '@/app/staking/components/convertDataToRowData'

const COLUMN_TO_DB_FIELD: Partial<Record<ColumnId, string>> = {
  period: 'period',
  action: 'action',
  total_amount: 'amount',
}

export default function StakingHistoryTable() {
  const isDesktop = useIsDesktop()
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const { rows, sort } = useTableContext<ColumnId, StakingHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, StakingHistoryCellDataMap>()
  const { prices } = usePricesContext()

  // Filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const filterSidebarRef = useRef<HTMLDivElement>(null)

  // Only apply click outside on desktop - mobile uses Modal component
  useClickOutside(filterSidebarRef, () => isDesktop && setIsFilterSidebarOpen(false))

  // Map sort columnId to database field
  const sortBy = sort?.columnId ? COLUMN_TO_DB_FIELD[sort.columnId] : 'period'
  const sortDirection = sort?.direction || 'desc'

  // Convert active filters to API format
  const apiFilters = useMemo(() => {
    const filter = (activeFilters: ActiveFilter[], groupId: string) =>
      activeFilters.filter(f => f.groupId === groupId).map(f => f.option.value)
    return {
      type: filter(activeFilters, 'type'),
    }
  }, [activeFilters])

  const { data, isLoading, error, count } = useGetStakingHistory({
    page: 1,
    pageSize: pageEnd,
    sortBy,
    sortDirection,
    type: apiFilters.type,
  })

  const rowData = useMemo(() => convertDataToRowData(data, prices), [data, prices])

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
      payload: { columnId: 'period', direction: 'desc' },
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
          STAKING EVENTS LIST
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
            <StakingHistoryFilterSideBar
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
          <DesktopStakingHistory rows={rows} />
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
