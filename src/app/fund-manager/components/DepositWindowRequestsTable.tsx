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

import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { GridTable } from '@/components/Table'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { type RequestStatus, StatusBadge } from './StatusBadge'

type RequestType = 'Deposit' | 'Withdrawal'

interface DepositWindowRequest {
  investor: Address
  entity: string
  type: RequestType
  date: string
  amountToken: string
  amountUsd: string
  tokenSymbol: string
  status: RequestStatus
}

const MOCK_DATA: DepositWindowRequest[] = [
  {
    investor: '0xF26E4b30b7c6e89b12960C70897e03f7Ce8Bf732' as Address,
    entity: 'Acme LLC',
    type: 'Deposit',
    date: 'Feb 24, 2026',
    amountToken: '999,999,999',
    amountUsd: '282.00',
    tokenSymbol: RBTC,
    status: 'Pending',
  },
  {
    investor: '0xF26E4b30b7c6e89b12960C70897e03f7Ce8Bf732' as Address,
    entity: 'Acme LLC',
    type: 'Deposit',
    date: 'Feb 23, 2026',
    amountToken: '999,999,999',
    amountUsd: '282.00',
    tokenSymbol: RBTC,
    status: 'Cancelled',
  },
  {
    investor: '0xF26E4b30b7c6e89b12960C70897e03f7Ce8Bf732' as Address,
    entity: 'Acme LLC',
    type: 'Deposit',
    date: 'Feb 22, 2026',
    amountToken: '999,999,999',
    amountUsd: '282.00',
    tokenSymbol: RBTC,
    status: 'Pending',
  },
  {
    investor: '0xF26E4b30b7c6e89b12960C70897e03f7Ce8Bf732' as Address,
    entity: 'Acme LLC',
    type: 'Withdrawal',
    date: 'Feb 1, 2026',
    amountToken: '999,999,999',
    amountUsd: '282.00',
    tokenSymbol: RBTC,
    status: 'Cancelled',
  },
  {
    investor: '0xF26E4b30b7c6e89b12960C70897e03f7Ce8Bf732' as Address,
    entity: 'Acme LLC',
    type: 'Withdrawal',
    date: 'Feb 1, 2026',
    amountToken: '999,999,999',
    amountUsd: '282.00',
    tokenSymbol: RBTC,
    status: 'Pending',
  },
]

const { accessor } = createColumnHelper<DepositWindowRequest>()

export const DepositWindowRequestsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
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
        cell: ({ cell }) => <Paragraph variant="body-s">{cell.getValue()}</Paragraph>,
        meta: { width: '1fr' },
      }),
      accessor('type', {
        id: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ cell }) => <Paragraph variant="body-s">{cell.getValue()}</Paragraph>,
        meta: { width: '0.8fr' },
      }),
      accessor('date', {
        id: 'date',
        header: 'Date',
        enableSorting: false,
        cell: ({ cell }) => <Paragraph variant="body-s">{cell.getValue()}</Paragraph>,
        meta: { width: '1fr' },
      }),
      accessor('amountToken', {
        id: 'amount',
        header: 'Amount',
        enableSorting: false,
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
    data: MOCK_DATA,
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
      <GridTable
        table={table}
        className="min-w-[700px]"
        aria-label="Deposit window requests table"
        data-testid="DepositWindowRequestsTable"
      />
    </div>
  )
}
