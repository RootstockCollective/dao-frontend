'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { AUDIT_LOG_PAGE_SIZE, useGetAuditLog } from '@/app/fund-admin/hooks/useAuditLog'
import { FilterIcon } from '@/components/Icons/FilterIcon'
import { TablePager } from '@/components/TableNew'
import { Header, Paragraph } from '@/components/Typography'
import { useTableActionsContext, useTableContext } from '@/shared/context'

import {
  auditEntriesToRows,
  type AuditLogCellDataMap,
  type ColumnId,
  DEFAULT_HEADERS,
  type SortableColumnId,
} from '../config'
import { AuditLogCsvButton } from './AuditLogCsvButton'
import { DesktopAuditLogHistory } from './DesktopAuditLogHistory'

function isSortableColumnId(id: ColumnId | null): id is SortableColumnId {
  return id === 'date' || id === 'action' || id === 'role'
}

export const AuditLogTable = () => {
  const { sort } = useTableContext<ColumnId, AuditLogCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, AuditLogCellDataMap>()
  const [pageEnd, setPageEnd] = useState(AUDIT_LOG_PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)
  const skipNextSortPagerReset = useRef(true)

  const sortField = isSortableColumnId(sort.columnId) ? sort.columnId : null

  const { entries, totalCount, isLoading, error } = useGetAuditLog({
    visibleItemCount: pageEnd,
    sortField,
    sortDirection: sort.direction,
  })

  const visibleRows = useMemo(() => auditEntriesToRows(entries), [entries])

  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
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

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      <div className="flex items-center justify-between h-14">
        <Header variant="h3" className="m-0" caps data-testid="audit-log-table-header">
          RECORD OF OPERATIONAL ACTIONS
        </Header>
        <div className="flex items-center gap-4">
          <AuditLogCsvButton sortField={sortField} sortDirection={sort.direction} />
          <button type="button" aria-label="Open filters" className="cursor-pointer">
            <FilterIcon size={24} color="white" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="w-full overflow-x-auto">
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
  )
}
