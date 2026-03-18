'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { Address } from 'viem'

import { useGetBtcVaultEntitiesHistory } from '@/app/fund-manager/hooks/useGetBtcVaultEntitiesHistory'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { GridTable } from '@/components/Table'
import { TablePager } from '@/components/TableNew'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { shortAddress } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'

import { type RequestStatus, StatusBadge } from './StatusBadge'

type RequestType = 'Deposit' | 'Withdrawal'

interface DepositWindowRequest {
  id: string
  investor: Address
  entity: string
  type: RequestType
  date: string
  timestamp: number
  amountToken: string
  amountUsd: string
  tokenSymbol: string
  status: RequestStatus
  actions: string
}

const { accessor } = createColumnHelper<DepositWindowRequest>()
const PAGE_SIZE = 20

const sortFieldByColumn: Record<
  string,
  'requestTimestamp' | 'assets' | 'status' | 'type' | 'investor' | 'entity'
> = {
  date: 'requestTimestamp',
  investor: 'investor',
  entity: 'entity',
  type: 'type',
  amount: 'assets',
  status: 'status',
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function normalizeStatus(status: string): RequestStatus {
  const value = status.toLowerCase()
  if (value.includes('cancel')) return 'Cancelled'
  return 'Pending'
}

export const DepositWindowRequestsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0
  const sortColumn = sorting[0]?.id ?? 'date'
  const sortDirection = sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : 'desc'
  const sortBy = sortFieldByColumn[sortColumn] ?? 'requestTimestamp'

  const { data, pagination, isLoading, error } = useGetBtcVaultEntitiesHistory({
    page: 1,
    pageSize: pageEnd,
    sortBy,
    sortDirection,
  })

  const rows = useMemo<DepositWindowRequest[]>(
    () =>
      data.map(item => ({
        id: item.id,
        investor: item.investor as Address,
        entity: item.entity,
        type: item.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal',
        date: formatDate(item.requestTimestamp),
        timestamp: item.requestTimestamp,
        amountToken: formatSymbol(item.assets, RBTC),
        amountUsd: formatCurrencyWithLabel(getFiatAmount(item.assets, rbtcPrice)),
        tokenSymbol: RBTC,
        status: normalizeStatus(item.status),
        actions: '—',
      })),
    [data, rbtcPrice],
  )

  const columns = useMemo(
    () => [
      accessor('timestamp', {
        id: 'date',
        header: 'Date',
        enableSorting: true,
        cell: ({ row }) => <Paragraph variant="body-s">{row.original.date}</Paragraph>,
        meta: { width: '1fr' },
      }),
      accessor('investor', {
        id: 'investor',
        header: 'Investor',
        enableSorting: true,
        cell: ({ cell }) => <ShortenAndCopy value={cell.getValue()} className="text-v3-primary" />,
        meta: { width: '1fr' },
      }),
      accessor('entity', {
        id: 'entity',
        header: 'Entity',
        enableSorting: true,
        cell: ({ cell }) => (
          <Paragraph variant="body-s">
            {cell.getValue().startsWith('0x') ? shortAddress(cell.getValue() as Address) : cell.getValue()}
          </Paragraph>
        ),
        meta: { width: '1fr' },
      }),
      accessor('type', {
        id: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ cell }) => <Paragraph variant="body-s">{cell.getValue()}</Paragraph>,
        meta: { width: '0.8fr' },
      }),
      accessor('amountToken', {
        id: 'amount',
        header: 'Amount',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Paragraph>{row.original.amountToken}</Paragraph>
              <TokenImage symbol={row.original.tokenSymbol} size={16} />
            </div>
            <Span variant="body-xs" className="text-text-40">
              {row.original.amountUsd} USD
            </Span>
          </div>
        ),
        meta: { width: '1.2fr' },
      }),
      accessor('status', {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
        meta: { width: '0.8fr' },
      }),
    ],
    [],
  )

  const table = useReactTable({
    columns,
    data: rows,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-10 w-full">
      <Header caps variant="h3">
        Deposit Window Requests
      </Header>
      {isLoading ? <LoadingSpinner size="large" /> : null}
      {error ? <Paragraph className="text-error">Could not load BTC vault entity history.</Paragraph> : null}
      <GridTable
        table={table}
        className="min-w-[700px]"
        aria-label="Deposit window requests table"
        data-testid="DepositWindowRequestsTable"
      />
      <TablePager
        pageSize={PAGE_SIZE}
        totalItems={pagination?.total ?? 0}
        onPageChange={({ end }) => setPageEnd(end)}
        pagedItemName="events"
        mode="expandable"
      />
    </div>
  )
}
