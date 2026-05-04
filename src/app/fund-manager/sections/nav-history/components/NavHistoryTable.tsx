'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { BtcVaultNavHistorySortField } from '@/app/api/btc-vault/v1/nav-history/types'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { NavColumnId, NavHistoryCellDataMap } from '../config'
import { DEFAULT_HEADERS, PAGE_SIZE } from '../config'
import { useGetBtcNavHistory } from '../hooks/useGetBtcNavHistory'
import { convertNavDataToRowData } from '../utils'
import { DesktopNavHistory } from './DesktopNavHistory'

const SORT_FIELD_BY_COLUMN: Partial<Record<NavColumnId, BtcVaultNavHistorySortField>> = {
  reportedOffchainAssets: 'reportedOffchainAssets',
  requestsProcessedInEpoch: 'requestsProcessedInEpoch',
  processedAt: 'processedAt',
}

export const NavHistoryTable = () => {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)

  const { sort } = useTableContext<NavColumnId, NavHistoryCellDataMap>()
  const dispatch = useTableActionsContext<NavColumnId, NavHistoryCellDataMap>()

  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const sortField: BtcVaultNavHistorySortField =
    (sort?.columnId && SORT_FIELD_BY_COLUMN[sort.columnId]) ?? 'processedAt'
  const sortDirection = sort?.direction || 'desc'

  const { rows, pagination, isLoading, error } = useGetBtcNavHistory({
    visibleItemCount: pageEnd,
    sortField,
    sortDirection,
  })

  const rowData = useMemo(() => convertNavDataToRowData(rows, rbtcPrice), [rows, rbtcPrice])

  const handlePageChange = useCallback(({ end }: { end: number }) => {
    setPageEnd(end)
  }, [])

  useEffect(() => {
    setPageEnd(PAGE_SIZE)
    setPagerKey(prev => prev + 1)
  }, [sortField, sortDirection])

  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: 'processedAt', direction: 'desc' } })
  }, [dispatch])

  useEffect(() => {
    dispatch({ type: 'SET_ROWS', payload: rowData })
  }, [dispatch, rowData])

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
  }, [dispatch, isLoading])

  useEffect(() => {
    dispatch({ type: 'SET_ERROR', payload: error ? error.message : null })
  }, [dispatch, error])

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      <Header variant="h3" className="m-0" data-testid="nav-history-header">
        NAV HISTORY
      </Header>

      <DesktopNavHistory isLoading={isLoading} />

      <TablePager
        key={pagerKey}
        pageSize={PAGE_SIZE}
        totalItems={pagination?.total ?? 0}
        onPageChange={handlePageChange}
        pagedItemName="entries"
        mode="expandable"
        data-testid="nav-history-table-pager"
      />
    </div>
  )
}
