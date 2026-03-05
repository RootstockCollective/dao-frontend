'use client'

import type { Dispatch, ReactNode } from 'react'
import { Suspense } from 'react'

import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'

import type {
  BtcVaultHistoryCellDataMap,
  BtcVaultHistoryTable,
  ColumnId,
} from './BtcVaultHistoryTable.config'
import { COLUMN_TRANSFORMS, SORT_LABELS } from './BtcVaultHistoryTable.config'

interface OrderIndicatorProps {
  columnId: ColumnId
}

const OrderIndicator = ({ columnId }: OrderIndicatorProps) => {
  const { sort } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()

  if (!sort) return null
  if (sort.columnId !== columnId) return <ArrowsUpDown />
  if (sort.direction === 'asc') return <ArrowUpWFill />
  return <ArrowDownWFill />
}

const dispatchSortRoundRobin = (
  dispatch: Dispatch<BtcVaultHistoryTable['Action']>,
  columnId: ColumnId,
  currentSort: BtcVaultHistoryTable['State']['sort'],
) => {
  const isSameColumn = currentSort.columnId === columnId
  if (!isSameColumn) {
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId, direction: SORT_DIRECTION_ASC } })
    return
  }
  const currentSortIndex = SORT_DIRECTIONS.indexOf(currentSort.direction)
  const nextSortIndex = (currentSortIndex + 1) % SORT_DIRECTIONS.length
  const nextSort = SORT_DIRECTIONS[nextSortIndex]
  dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: nextSort ? columnId : null, direction: nextSort } })
}

interface HeaderCellProps {
  children: ReactNode
  columnId: ColumnId
}

const HeaderCell = ({ children, columnId }: HeaderCellProps) => {
  const { sort, columns } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BtcVaultHistoryCellDataMap>()

  const column = columns.find(({ id }) => id === columnId)
  if (!column || column.hidden) return null

  const isSortable = column.sortable

  return (
    <TableHeaderCell
      className={cn('h-full', COLUMN_TRANSFORMS[columnId])}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
      data-testid={`BtcVaultHistoryHeaderCell-${columnId}`}
    >
      {isSortable && (
        <div className="flex pt-1 justify-center gap-2">
          <OrderIndicator columnId={columnId} />
        </div>
      )}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

export const BtcVaultHistoryHeaderRow = () => (
  <Suspense fallback={<div>Loading table headers...</div>}>
    <thead>
      <tr
        className="flex select-none gap-4 pb-2 pl-4 border-b-1 border-b-v3-text-60"
        data-testid="BtcVaultHistoryHeaderRow"
      >
        <HeaderCell columnId="type">
          <Label variant="tag-s" className="cursor-[inherit]">
            {SORT_LABELS.type}
          </Label>
        </HeaderCell>
        <HeaderCell columnId="date">
          <Label variant="tag-s" className="cursor-[inherit]">
            {SORT_LABELS.date}
          </Label>
        </HeaderCell>
        <HeaderCell columnId="amount">
          <Label variant="tag-s" className="cursor-[inherit]">
            {SORT_LABELS.amount}
          </Label>
        </HeaderCell>
        <HeaderCell columnId="status">
          <Label variant="tag-s" className="cursor-[inherit]">
            {SORT_LABELS.status}
          </Label>
        </HeaderCell>
        <HeaderCell columnId="actions">
          <Label variant="tag-s" className="cursor-[inherit]">
            {SORT_LABELS.actions}
          </Label>
        </HeaderCell>
      </tr>
    </thead>
  </Suspense>
)
