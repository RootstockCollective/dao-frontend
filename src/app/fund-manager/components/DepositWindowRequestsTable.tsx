'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useGetBtcVaultEntitiesHistory } from '@/app/fund-manager/hooks/useGetBtcVaultEntitiesHistory'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { usePricesContext } from '@/shared/context/PricesContext'

import { convertDataToRowData } from './convertDataToRowData'
import type { ColumnId, DepositWindowCellDataMap } from './DepositWindowRequestsTable.config'
import { DEFAULT_HEADERS, PAGE_SIZE } from './DepositWindowRequestsTable.config'
import { DesktopDepositWindowRequests } from './DesktopDepositWindowRequests'

const SORT_FIELD_BY_COLUMN: Partial<Record<ColumnId, 'timestamp' | 'assets'>> = {
  date: 'timestamp',
  amount: 'assets',
}

export const DepositWindowRequestsTable = () => {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)

  const { sort } = useTableContext<ColumnId, DepositWindowCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, DepositWindowCellDataMap>()

  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const sortBy = sort?.columnId ? SORT_FIELD_BY_COLUMN[sort.columnId] : 'timestamp'
  const sortDirection = sort?.direction || 'desc'

  const { data, pagination, isLoading, error } = useGetBtcVaultEntitiesHistory({
    page: 1,
    pageSize: pageEnd,
    sortBy,
    sortDirection,
  })

  const rowData = useMemo(() => convertDataToRowData(data, rbtcPrice), [data, rbtcPrice])

  const handlePageChange = useCallback(({ end }: { end: number }) => {
    setPageEnd(end)
  }, [])

  // Reset pagination when sort changes
  useEffect(() => {
    setPageEnd(PAGE_SIZE)
    setPagerKey(prev => prev + 1)
  }, [sortBy, sortDirection])

  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: 'date', direction: 'desc' } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    dispatch({ type: 'SET_ROWS', payload: rowData })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData])

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading || false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      <Header variant="h3" className="m-0" data-testid="deposit-window-header">
        DEPOSIT WINDOW REQUESTS
      </Header>

      <DesktopDepositWindowRequests />

      <TablePager
        key={pagerKey}
        pageSize={PAGE_SIZE}
        totalItems={pagination?.total ?? 0}
        onPageChange={handlePageChange}
        pagedItemName="requests"
        mode="expandable"
        data-testid="deposit-window-table-pager"
      />
    </div>
  )
}
