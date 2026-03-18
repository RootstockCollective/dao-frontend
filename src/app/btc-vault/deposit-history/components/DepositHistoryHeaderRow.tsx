'use client'

import type { ReactNode } from 'react'
import { Suspense } from 'react'

import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'

import type { ColumnId, DepositHistoryCellDataMap } from './DepositHistoryTable.config'
import { COLUMN_TRANSFORMS, SORT_LABELS } from './DepositHistoryTable.config'

interface HeaderCellProps {
  children: ReactNode
  columnId: ColumnId
}

const HeaderCell = ({ children, columnId }: HeaderCellProps) => {
  const { columns } = useTableContext<ColumnId, DepositHistoryCellDataMap>()
  const column = columns.find(({ id }) => id === columnId)
  if (!column || column.hidden) return null

  return (
    <TableHeaderCell
      className={cn('h-full', COLUMN_TRANSFORMS[columnId])}
      data-testid={`deposit-history-header-cell-${columnId}`}
    >
      <TableHeaderNode className="cursor-default">{children}</TableHeaderNode>
    </TableHeaderCell>
  )
}

const VISIBLE_COLUMN_IDS: ('depositWindow' | 'startDate' | 'endDate' | 'tvl' | 'apy')[] = [
  'depositWindow',
  'startDate',
  'endDate',
  'tvl',
  'apy',
]

export const DepositHistoryHeaderRow = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <thead>
      <tr
        className="flex select-none gap-4 pb-2 pl-4 border-b-1 border-b-v3-text-60"
        data-testid="deposit-history-header-row"
      >
        {VISIBLE_COLUMN_IDS.map(columnId => (
          <HeaderCell key={columnId} columnId={columnId}>
            <Label variant="tag-s" className="cursor-[inherit]">
              {SORT_LABELS[columnId]}
            </Label>
          </HeaderCell>
        ))}
      </tr>
    </thead>
  </Suspense>
)
