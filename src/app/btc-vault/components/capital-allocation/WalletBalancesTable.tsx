'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { type HTMLAttributes, useMemo, useState } from 'react'

import { ArrowUpRightIcon } from '@/components/Icons/ArrowUpRightIcon'
import { GridTable } from '@/components/Table/GridTable'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import type { WalletBalanceDisplay } from '../../services/ui/types'
import { DEFAULT_VISIBLE_WALLETS } from './WalletBalancesTable.constants'

interface Props extends HTMLAttributes<HTMLDivElement> {
  wallets: WalletBalanceDisplay[]
  'data-testid'?: string
}

const { accessor } = createColumnHelper<WalletBalanceDisplay>()

export function WalletBalancesTable({ wallets, className, 'data-testid': testId, ...props }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'percentage', desc: true }])

  const totals = useMemo(() => {
    const totalAmount = wallets.reduce((sum, w) => sum + parseFloat(w.amountFormatted), 0)
    const totalFiat = wallets.reduce((sum, w) => {
      const num = parseFloat(w.fiatAmountFormatted.replaceAll(/[^0-9.-]/g, ''))
      return sum + (isNaN(num) ? 0 : num)
    }, 0)
    const totalPercent = wallets.reduce((sum, w) => sum + parseFloat(w.percentFormatted), 0)
    return {
      amountFormatted: totalAmount.toFixed(5),
      fiatAmountFormatted: `$${totalFiat.toFixed(2)}`,
      percentFormatted: `${totalPercent.toFixed(2)}%`,
    }
  }, [wallets])

  const columns = useMemo(
    () => [
      accessor('label', {
        id: 'wallet',
        header: 'On-chain wallets',
        cell: ({ getValue }) => <Span variant="body-s">{getValue()}</Span>,
        meta: { width: '1.5fr' },
      }),
      accessor('trackingPlatform', {
        id: 'tracking',
        header: 'Tracking',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1">
            <a
              href={row.original.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              data-testid={`tracking-link-${row.index}`}
            >
              <Span variant="body-s" className="text-primary">
                {row.original.trackingPlatform}
              </Span>
            </a>
            <ArrowUpRightIcon size={14} />
          </span>
        ),
        meta: { width: '1fr' },
      }),
      accessor('amountFormatted', {
        id: 'balance',
        header: () => (
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-1">
            <Span variant="body-s" bold className="justify-self-end">
              {totals.amountFormatted}
            </Span>
            <TokenImage symbol={RBTC} size={16} />
            <Span variant="body-xs" className="justify-self-end text-text-60">
              {totals.fiatAmountFormatted}
            </Span>
            <Span variant="body-xs" className="text-text-60">
              USD
            </Span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="ml-auto grid grid-cols-[1fr_auto] items-center gap-x-1">
            <Span variant="body-s" bold className="justify-self-end">
              {row.original.amountFormatted}
            </Span>
            <TokenImage symbol={RBTC} size={16} />
            <Span variant="body-xs" className="justify-self-end text-text-60">
              {row.original.fiatAmountFormatted.replace(/\s*USD\s*$/, '')}
            </Span>
            <Span variant="body-xs" className="text-text-60">
              USD
            </Span>
          </div>
        ),
        sortingFn: (a, b) => parseFloat(a.original.amountFormatted) - parseFloat(b.original.amountFormatted),
        meta: { width: '1fr' },
      }),
      accessor('percentFormatted', {
        id: 'percentage',
        header: () => (
          <Span variant="body-s" bold>
            {totals.percentFormatted}
          </Span>
        ),
        cell: ({ getValue }) => (
          <Span variant="body-s" className="ml-auto">
            {getValue()}
          </Span>
        ),
        sortingFn: (a, b) =>
          parseFloat(a.original.percentFormatted) - parseFloat(b.original.percentFormatted),
        meta: { width: '0.5fr' },
      }),
    ],
    [totals],
  )

  const table = useReactTable({
    columns,
    data: wallets,
    state: {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: showAll ? wallets.length : DEFAULT_VISIBLE_WALLETS,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (wallets.length === 0) {
    return (
      <div
        data-testid={testId ?? 'wallet-balances-table'}
        className={cn('flex min-h-[200px] items-center justify-center', className)}
        {...props}
      >
        <Span variant="body-s" className="text-text-60">
          No wallets configured
        </Span>
      </div>
    )
  }

  return (
    <div
      data-testid={testId ?? 'wallet-balances-table'}
      className={cn('w-full overflow-x-auto', className)}
      {...props}
    >
      <GridTable
        table={table}
        rowStyles="py-2"
        headerClassName="pb-[5px]"
        className="min-w-[540px]"
        data-testid="wallet-grid-table"
      />
      {wallets.length > DEFAULT_VISIBLE_WALLETS && (
        <div className="flex justify-start pt-4">
          <button
            type="button"
            onClick={() => setShowAll(prev => !prev)}
            className="rounded-sm border border-text-60 px-4 py-2 font-rootstock-sans text-sm transition-colors hover:bg-text-80"
            data-testid="show-all-wallets-button"
          >
            {showAll ? 'Show fewer wallets' : 'Show all wallets'}
          </button>
        </div>
      )}
    </div>
  )
}
