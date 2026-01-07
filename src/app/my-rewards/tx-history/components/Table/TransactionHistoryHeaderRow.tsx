'use client'

import { useTableActionsContext, useTableContext } from '@/shared/context'
import { ReactElement, ReactNode, Suspense, useMemo } from 'react'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'
import { Dispatch, FC } from 'react'
import {
  TransactionHistoryCellDataMap,
  TransactionHistoryTable,
  COLUMN_TRANSFORMS,
  ColumnId,
} from './TransactionHistoryTable.config'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'

const OrderIndicatorContainer: FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cn('flex pt-1 justify-center gap-2', className)}>{children}</div>

const OrderIndicator: FC<{ columnId: ColumnId }> = ({ columnId }) => {
  const { sort } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()

  if (!sort || columnId === undefined) return null

  if (sort.columnId !== columnId) {
    return (
      <OrderIndicatorContainer>
        <ArrowsUpDown />
      </OrderIndicatorContainer>
    )
  }

  if (sort.direction === 'asc') {
    return (
      <OrderIndicatorContainer>
        <ArrowUpWFill />
      </OrderIndicatorContainer>
    )
  }

  return (
    <OrderIndicatorContainer>
      <ArrowDownWFill />
    </OrderIndicatorContainer>
  )
}

const dispatchSortRoundRobin = (
  dispatch: Dispatch<TransactionHistoryTable['Action']>,
  columnId: ColumnId,
  currentSort: TransactionHistoryTable['State']['sort'],
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

const HeaderTitle: FC<{ className?: string; children: ReactNode }> = ({ className, children }) => (
  <Label variant="tag-s" className={cn('cursor-[inherit]', className)}>
    {children}
  </Label>
)

const HeaderSubtotal: FC<{ value: string }> = ({ value }) => (
  <Paragraph variant="body" bold className="mt-1 text-v3-text-100">
    {value}
  </Paragraph>
)

export const HeaderCell = ({
  className,
  children,
  columnId,
}: {
  className?: string
  children: React.ReactNode
  columnId: ColumnId
}): ReactElement | null => {
  const { sort, columns } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, TransactionHistoryCellDataMap>()

  const column = columns.find(({ id }) => id === columnId)

  if (!column || column.hidden) {
    return null
  }

  const isSortable = column.sortable
  const columnClassNames = COLUMN_TRANSFORMS[columnId]
  const isJustifyCenter = columnClassNames?.match('justify-center')?.length ?? false

  return (
    <TableHeaderCell
      className={cn('h-full', columnClassNames, className)}
      contentClassName={isJustifyCenter ? 'justify-center' : ''}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

export const TransactionHistoryHeaderRow = (): ReactElement => {
  const { rows } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()

  const visibleTotalAmountUsd = useMemo(() => {
    if (!rows.length) return ''

    const sanitize = (raw: string | null | undefined) => {
      if (!raw) return 0
      if (raw.startsWith('<')) return 0
      const sanitized = raw.replace(/,/g, '')
      const parsed = Number(sanitized)
      return Number.isNaN(parsed) ? 0 : parsed
    }

    const sum = rows.reduce((acc, row) => {
      const usd = row.data.total_amount.usd
      const values = Array.isArray(usd) ? usd : [usd]
      return acc + values.reduce((subtotal, val) => subtotal + sanitize(val), 0)
    }, 0)

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(sum)
  }, [rows])

  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="flex border-b-1 border-b-v3-text-60 select-none gap-4 pb-4 pl-4">
        <HeaderCell columnId="cycle">
          <HeaderTitle>Cycle</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="date">
          <HeaderTitle>Date</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="from_to">
          <HeaderTitle>From/To</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="type">
          <HeaderTitle>Type</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="amount">
          <HeaderTitle>Amount</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="total_amount">
          <div className="flex flex-col items-center">
            <HeaderTitle>Total Amount (USD)</HeaderTitle>
            {visibleTotalAmountUsd && <HeaderSubtotal value={visibleTotalAmountUsd} />}
          </div>
        </HeaderCell>
      </tr>
    </Suspense>
  )
}
