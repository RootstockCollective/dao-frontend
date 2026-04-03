'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useGetBtcVaultEntitiesHistory } from '@/app/fund-manager/sections/transactions/hooks/useGetBtcVaultEntitiesHistory'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { ColumnId, DepositWindowCellDataMap } from '../config'
import { DEFAULT_HEADERS, PAGE_SIZE } from '../config'
import { convertDataToRowData } from '../utils'
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

  const sortBy = (sort?.columnId && SORT_FIELD_BY_COLUMN[sort.columnId]) ?? 'timestamp'
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
      <Header variant="h3" className="m-0" data-testid="deposit-window-header">
        DEPOSIT WINDOW REQUESTS
      </Header>

      <DesktopDepositWindowRequests isLoading={isLoading} />

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
