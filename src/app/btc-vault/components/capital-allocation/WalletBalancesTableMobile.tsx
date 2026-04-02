'use client'

import { flexRender, type Row, type Table as ReactTable } from '@tanstack/react-table'

import type { WalletBalanceDisplay } from '@/app/btc-vault/services/ui/types'
import { Expandable, ExpandableContent, ExpandableHeader } from '@/components/Expandable'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

function renderCell(row: Row<WalletBalanceDisplay>, columnId: string) {
  const cell = row.getVisibleCells().find(c => c.column.columnDef.id === columnId)
  if (!cell) return null
  return flexRender(cell.column.columnDef.cell, cell.getContext())
}

/** Mobile expand panel: inline amount + token (desktop cell uses a 2-col grid that parks the icon on the right). */
function MobileExpandBalance({ row }: { row: Row<WalletBalanceDisplay> }) {
  const w = row.original
  const fiatLine = w.fiatAmountFormatted.replace(/\s*USD\s*$/, '')
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <span className="flex min-w-0 flex-wrap items-center gap-x-1">
        <Span variant="body-s" bold>
          {w.amountFormatted}
        </Span>
        <TokenImage symbol={RBTC} size={16} />
      </span>
      <span className="flex flex-wrap items-center gap-x-1">
        <Span variant="body-xs" className="text-text-60">
          {fiatLine}
        </Span>
        <Span variant="body-xs" className="text-text-60">
          USD
        </Span>
      </span>
    </div>
  )
}

function ExpandableWalletRow({ row }: { row: Row<WalletBalanceDisplay> }) {
  return (
    <div role="row" className="mb-5 last:mb-0" data-testid={`wallet-mobile-row-${row.index}`}>
      <Expandable className="border-b border-b-bg-60 pb-5">
        <ExpandableHeader triggerColor="var(--color-bg-0)">{renderCell(row, 'wallet')}</ExpandableHeader>
        <ExpandableContent>
          <div className="flex flex-col gap-3 pt-2">
            <div>
              <Span variant="body-xs" className="text-text-40">
                Tracking
              </Span>
              <div>{renderCell(row, 'tracking')}</div>
            </div>
            <div>
              <Span variant="body-xs" className="text-text-40">
                Balance
              </Span>
              <MobileExpandBalance row={row} />
            </div>
            <div>
              <Span variant="body-xs" className="text-text-40">
                Allocation
              </Span>
              <div className="[&>span]:ml-0">{renderCell(row, 'percentage')}</div>
            </div>
          </div>
        </ExpandableContent>
      </Expandable>
    </div>
  )
}

export function WalletBalancesTableMobile({ table }: { table: ReactTable<WalletBalanceDisplay> }) {
  return (
    <div className="w-full min-w-0" data-testid="wallet-balances-mobile">
      {table.getRowModel().rows.map(row => (
        <ExpandableWalletRow key={row.id} row={row} />
      ))}
    </div>
  )
}
