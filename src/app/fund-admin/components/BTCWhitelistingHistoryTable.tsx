'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { BtcVaultWhitelistedUsersSortField } from '@/app/api/btc-vault/v1/whitelist-role-history/action'
import { TablePager } from '@/components/TableNew'
import { Header } from '@/components/Typography'
import { useTableActionsContext, useTableContext } from '@/shared/context'

import {
  BTC_VAULT_WHITELISTED_USERS_QUERY_KEY,
  useGetBTCWhitelistingHistory,
} from '../hooks/useGetBTCWhitelistingHistory'
import {
  type ColumnId,
  DEFAULT_HEADERS,
  PAGE_SIZE,
  type WhitelistCellDataMap,
} from './BTCWhitelistingHistoryTable.config'
import { convertDataToRowData } from './convertDataToRowData'
import { DesktopBTCWhitelistingHistory } from './DesktopBTCWhitelistingHistory'
import { DeWhitelistConfirmModal } from './DeWhitelistConfirmModal'

const SORT_FIELD_BY_COLUMN: Partial<Record<ColumnId, BtcVaultWhitelistedUsersSortField>> = {
  date: 'lastUpdated',
  address: 'account',
  status: 'status',
  institution: 'lastUpdated',
}

interface BTCWhitelistingHistoryTableProps {
  /** When set (e.g. from TabsSection), used after de-whitelist success; same refetch as grant success. */
  onWhitelistDataChange?: () => void
}

export const BTCWhitelistingHistoryTable = ({ onWhitelistDataChange }: BTCWhitelistingHistoryTableProps) => {
  const queryClient = useQueryClient()
  const [deWhitelistFullAddress, setDeWhitelistFullAddress] = useState<string | null>(null)
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const [pagerKey, setPagerKey] = useState(0)
  const { rows, sort } = useTableContext<ColumnId, WhitelistCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, WhitelistCellDataMap>()

  const sortDirection = sort?.direction || 'desc'
  const sortColumnId = sort?.columnId
  const sortField =
    (sortColumnId ? SORT_FIELD_BY_COLUMN[sortColumnId] : undefined) ?? ('lastUpdated' as const)

  const {
    rows: apiRows,
    pagination,
    isLoading,
    error,
  } = useGetBTCWhitelistingHistory({
    visibleItemCount: pageEnd,
    sortField,
    sortDirection,
  })

  const rowData = useMemo(() => convertDataToRowData(apiRows), [apiRows])
  const totalCount = pagination?.total ?? 0

  const handlePageChange = useCallback(({ end }: { end: number }) => {
    setPageEnd(end)
  }, [])

  useEffect(() => {
    setPageEnd(PAGE_SIZE)
    setPagerKey(prev => prev + 1)
  }, [sortField, sortDirection])

  // Mount: column definitions and default sort (newest first).
  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: 'date', direction: 'desc' } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally run once on mount

  useEffect(() => {
    dispatch({ type: 'SET_ROWS', payload: rowData })
  }, [dispatch, rowData])

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
  }, [dispatch, isLoading])

  useEffect(() => {
    dispatch({
      type: 'SET_ERROR',
      payload: error instanceof Error ? error.message : error ? String(error) : null,
    })
  }, [dispatch, error])

  const handleRowAction = useCallback((address: string) => {
    setDeWhitelistFullAddress(address)
  }, [])

  const refetchWhitelistQueries = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: [...BTC_VAULT_WHITELISTED_USERS_QUERY_KEY],
      type: 'all',
    })
  }, [queryClient])

  const handleDeWhitelistSuccess = onWhitelistDataChange ?? refetchWhitelistQueries

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      <Header variant="h3" className="m-0" data-testid="whitelist-header">
        WHITELIST
      </Header>

      {deWhitelistFullAddress && (
        <DeWhitelistConfirmModal
          fullAddress={deWhitelistFullAddress}
          onClose={() => setDeWhitelistFullAddress(null)}
          onSuccess={handleDeWhitelistSuccess}
        />
      )}

      <DesktopBTCWhitelistingHistory rows={rows} onRowAction={handleRowAction} />

      <TablePager
        key={pagerKey}
        pageSize={PAGE_SIZE}
        totalItems={totalCount}
        onPageChange={handlePageChange}
        pagedItemName="entries"
        mode="expandable"
      />
    </div>
  )
}
