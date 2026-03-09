'use client'

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { type HTMLAttributes, useMemo, useState } from 'react'

import { ExternalLinkIcon } from '@/components/Icons/ExternalLinkIcon'
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

const GRID_TEMPLATE = '1.5fr 1fr 1.5fr 0.75fr'

const { accessor } = createColumnHelper<WalletBalanceDisplay>()

const columns = [
  accessor('label', {
    id: 'wallet',
    header: 'On-chain wallets',
    cell: ({ getValue }) => <Span variant="body-s">{getValue()}</Span>,
    enableSorting: false,
    meta: { width: '1.5fr' },
  }),
  accessor('trackingPlatform', {
    id: 'tracking',
    header: 'Tracking',
    cell: ({ row }) => (
      <a
        href={row.original.trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline"
        data-testid={`tracking-link-${row.index}`}
      >
        <Span variant="body-s" className="text-primary">
          {row.original.trackingPlatform}
        </Span>
        <ExternalLinkIcon size={14} />
      </a>
    ),
    enableSorting: false,
    meta: { width: '1fr' },
  }),
  accessor('amountFormatted', {
    id: 'balance',
    header: 'Balance',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="flex items-center gap-1">
          <Span variant="body-s" bold>
            {row.original.amountFormatted}
          </Span>
          <TokenImage symbol={RBTC} size={16} />
        </span>
        <Span variant="tag-s" className="text-text-60">
          {row.original.fiatAmountFormatted}
        </Span>
      </div>
    ),
    enableSorting: false,
    meta: { width: '1.5fr' },
  }),
  accessor('percentFormatted', {
    id: 'percentage',
    header: 'Percentage',
    cell: ({ getValue }) => <Span variant="body-s">{getValue()}</Span>,
    enableSorting: false,
    meta: { width: '0.75fr' },
  }),
]

export function WalletBalancesTable({ wallets, className, 'data-testid': testId, ...props }: Props) {
  const [showAll, setShowAll] = useState(false)

  const visibleWallets = useMemo(
    () => (showAll ? wallets : wallets.slice(0, DEFAULT_VISIBLE_WALLETS)),
    [wallets, showAll],
  )

  const summary = useMemo(() => {
    if (wallets.length === 0) return null
    const totalAmount = wallets.reduce((sum, w) => sum + parseFloat(w.amountFormatted), 0)
    const totalFiat = wallets.reduce((sum, w) => {
      const num = parseFloat(w.fiatAmountFormatted.replace(/[^0-9.-]/g, ''))
      return sum + (isNaN(num) ? 0 : num)
    }, 0)
    const totalPercent = wallets.reduce((sum, w) => sum + parseFloat(w.percentFormatted), 0)
    return {
      amountFormatted: totalAmount.toFixed(5),
      fiatAmountFormatted: `$${totalFiat.toFixed(2)} USD`,
      percentFormatted: `${totalPercent.toFixed(2)}%`,
    }
  }, [wallets])

  const table = useReactTable({
    columns,
    data: visibleWallets,
    getCoreRowModel: getCoreRowModel(),
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
    <div data-testid={testId ?? 'wallet-balances-table'} className={cn('w-full', className)} {...props}>
      {summary && (
        <div
          data-testid="wallet-summary-row"
          className="grid gap-4 border-b border-b-text-60 px-4 pb-4"
          style={{ gridTemplateColumns: GRID_TEMPLATE }}
        >
          <div />
          <div />
          <div className="flex flex-col">
            <span className="flex items-center gap-1">
              <Span variant="body-s" bold>
                {summary.amountFormatted}
              </Span>
              <TokenImage symbol={RBTC} size={16} />
            </span>
            <Span variant="tag-s" className="text-text-60">
              {summary.fiatAmountFormatted}
            </Span>
          </div>
          <Span variant="body-s" bold>
            {summary.percentFormatted}
          </Span>
        </div>
      )}
      <GridTable table={table} rowStyles="py-2" data-testid="wallet-grid-table" />
      {wallets.length > DEFAULT_VISIBLE_WALLETS && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setShowAll(prev => !prev)}
            className="rounded-sm border border-text-60 px-4 py-2 text-sm transition-colors hover:bg-text-80"
            data-testid="show-all-wallets-button"
          >
            {showAll ? 'Show fewer wallets' : 'Show all wallets'}
          </button>
        </div>
      )}
    </div>
  )
}
