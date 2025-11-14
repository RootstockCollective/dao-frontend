'use client'

import { useGetTransactionHistory } from '../../hooks/useGetTransactionHistory'
import { useTableActionsContext, useTableContext, usePricesContext } from '@/shared/context'
import { useEffect, useMemo, useState } from 'react'
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

const COLUMN_TO_DB_FIELD: Partial<Record<ColumnId, string>> = {
  cycle: 'cycleStart',
  date: 'blockTimestamp',
  type: 'type',
  total_amount: 'blockTimestamp', // Use timestamp as fallback since total is calculated
}

export default function TransactionHistoryTable() {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const { rows, sort } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, TransactionHistoryCellDataMap>()
  const { prices } = usePricesContext()
  const {
    data: { cycleDuration },
  } = useCycleContext()

  // Map sort columnId to database field
  const sortBy = sort?.columnId ? COLUMN_TO_DB_FIELD[sort.columnId] : 'blockTimestamp'
  const sortDirection = sort?.direction || 'desc'

  const { data, isLoading, error, count } = useGetTransactionHistory({
    page: 1,
    pageSize: pageEnd,
    sortBy,
    sortDirection,
  })

  const rowData = useMemo(() => {
    return convertDataToRowData(data, cycleDuration, prices)
  }, [data, cycleDuration, prices])

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
      <Header variant="h3" className="m-0 text-v3-text-100" data-testid="backer-rewards-header">
        EVENTS LIST
      </Header>
      <DesktopTransactionHistory rows={rows} />
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
