'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { useTableActionsContext, withTableContext } from '@/shared/context'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { useDepositHistory } from '../../hooks/useDepositHistory'
import { convertDataToRowData } from './convertDataToRowData'
import type { ColumnId, DepositHistoryCellDataMap } from './DepositHistoryTable.config'
import { DEFAULT_HEADERS, PAGE_SIZE } from './DepositHistoryTable.config'
import { DesktopDepositHistory } from './DesktopDepositHistory'
import { MobileDepositHistory } from './MobileDepositHistory'

function DepositHistoryTableInner() {
  const isDesktop = useIsDesktop()
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const dispatch = useTableActionsContext<ColumnId, DepositHistoryCellDataMap>()

  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { data, isLoading, error } = useDepositHistory({ page: 1, limit: pageEnd })

  const rowData = useMemo(() => convertDataToRowData(data?.data, rbtcPrice), [data?.data, rbtcPrice])

  const handlePageChange = useCallback(({ end }: { end: number }) => {
    setPageEnd(end)
  }, [])

  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
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
    <div className="w-full flex flex-col gap-6 md:gap-10">
      <Header variant="h3" className="m-0 text-lg md:text-xl" data-testid="deposit-history-list-header">
        DEPOSIT WINDOWS LIST
      </Header>
      {isDesktop ? <DesktopDepositHistory /> : <MobileDepositHistory />}
      <TablePager
        pageSize={PAGE_SIZE}
        totalItems={data?.total ?? 0}
        onPageChange={handlePageChange}
        pagedItemName="epochs"
        mode="expandable"
        data-testid="deposit-history-table-pager"
      />
    </div>
  )
}

export const DepositHistoryTableWithContext = withTableContext<ColumnId, DepositHistoryCellDataMap>(
  DepositHistoryTableInner,
)
