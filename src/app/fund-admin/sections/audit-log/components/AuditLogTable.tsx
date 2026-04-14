'use client'

import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { FilterButton } from '@/app/proposals/components/filter/FilterButton'
import { ActiveFilter } from '@/components/FilterSideBar/types'
import { TablePager } from '@/components/TableNew'
import { Header, Paragraph } from '@/components/Typography'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useScrollLock } from '@/shared/hooks/useScrollLock'

import { AUDIT_LOG_PAGE_SIZE, DEFAULT_COLUMNS } from '../constants'
import { useGetAuditLog } from '../hooks/'
import { AuditLogCellDataMap, ColumnId, SortableColumnId } from '../types'
import { convertAuditEntriesToRows } from '../utils'
import { AuditLogCsvButton } from './AuditLogCsvButton'
import { AuditLogFilterSideBar } from './AuditLogFilterSideBar'
import { DesktopAuditLogHistory } from './DesktopAuditLogHistory'

function isSortableColumnId(id: ColumnId | null): id is SortableColumnId {
  return id === 'date' || id === 'action' || id === 'role'
}

export const AuditLogTable = () => {
  const isDesktop = useIsDesktop()
  const { sort } = useTableContext<ColumnId, AuditLogCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, AuditLogCellDataMap>()
  const [pageEnd, setPageEnd] = useState(AUDIT_LOG_PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)
  const skipNextSortPagerReset = useRef(true)

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const filterSidebarRef = useRef<HTMLDivElement>(null)

  useScrollLock(isFilterSidebarOpen && !isDesktop)
  useClickOutside(filterSidebarRef, () => isDesktop && setIsFilterSidebarOpen(false))

  const hasActiveFilters = useMemo(() => activeFilters.length > 0, [activeFilters])

  const handleApplyFilters = (filters: ActiveFilter[]) => {
    setActiveFilters(filters)
  }

  const sortField = isSortableColumnId(sort.columnId) ? sort.columnId : null

  const { entries, isLoading, error, pagination } = useGetAuditLog({
    visibleItemCount: pageEnd,
    sortField,
    sortDirection: sort.direction,
  })

  const visibleRows = useMemo(() => convertAuditEntriesToRows(entries), [entries])
  const totalCount = pagination?.total ?? 0

  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_COLUMNS })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: 'date', direction: 'desc' } })
  }, [dispatch])

  useEffect(() => {
    dispatch({ type: 'SET_ROWS', payload: visibleRows })
  }, [dispatch, visibleRows])

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
  }, [dispatch, isLoading])

  useEffect(() => {
    dispatch({
      type: 'SET_ERROR',
      payload: error instanceof Error ? error.message : error ? String(error) : null,
    })
  }, [dispatch, error])

  useEffect(() => {
    if (skipNextSortPagerReset.current) {
      skipNextSortPagerReset.current = false
    } else {
      setPageEnd(AUDIT_LOG_PAGE_SIZE)
      setPagerKey(k => k + 1)
    }
  }, [sort.columnId, sort.direction])

  // Reset pager when filters change
  useEffect(() => {
    setPageEnd(AUDIT_LOG_PAGE_SIZE)
    setPagerKey(k => k + 1)
  }, [activeFilters])

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      <div className="flex items-center justify-between h-14">
        <Header variant="h3" className="m-0" caps data-testid="audit-log-table-header">
          RECORD OF OPERATIONAL ACTIONS
        </Header>
        <div className="flex items-center gap-4">
          <AuditLogCsvButton sortField={sortField} sortDirection={sort.direction} />
          <div className="flex items-center">
            <FilterButton
              isOpen={isFilterSidebarOpen}
              setIsOpen={setIsFilterSidebarOpen}
              isFiltering={hasActiveFilters}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row-reverse">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isFilterSidebarOpen ? 264 : 0 }}
          className="overflow-hidden shrink-0"
        >
          <div ref={filterSidebarRef} className="pl-2 h-full">
            <AuditLogFilterSideBar
              isOpen={isFilterSidebarOpen}
              onClose={() => setIsFilterSidebarOpen(false)}
              activeFilters={activeFilters}
              onApply={handleApplyFilters}
            />
          </div>
        </motion.div>

        <div className="grow flex flex-col gap-6 overflow-x-auto">
          <div className="w-full">
            {error ? (
              <Paragraph variant="body-s" className="text-v3-text-100 py-8">
                Could not load the audit log. Try again later.
              </Paragraph>
            ) : isLoading ? (
              <Paragraph variant="body-s" className="text-v3-bg-accent-0 py-8">
                Loading…
              </Paragraph>
            ) : (
              <DesktopAuditLogHistory />
            )}
          </div>

          {!error && !isLoading && (
            <TablePager
              key={pagerKey}
              pageSize={AUDIT_LOG_PAGE_SIZE}
              totalItems={totalCount}
              onPageChange={({ end }) => {
                setPageEnd(end)
              }}
              pagedItemName="events"
              mode="expandable"
            />
          )}
        </div>
      </div>
    </div>
  )
}
