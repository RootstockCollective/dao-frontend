'use client'

import { useTableActionsContext, useTableContext } from '@/shared/context'
import { ReactElement, Suspense } from 'react'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useTotalAmount } from '../../hooks/useTotalAmount'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'
import { Dispatch, FC } from 'react'
import {
  TransactionHistoryCellDataMap,
  TransactionHistoryTable,
  COLUMN_TRANSFORMS,
  ColumnId,
} from '../../config'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'

interface ChildrenWithClassNameProps {
  children: React.ReactNode
  className?: string
}

const OrderIndicatorContainer: FC<ChildrenWithClassNameProps> = ({ children, className }) => (
  <div className={cn('flex justify-center gap-2', className)}>{children}</div>
)

const OrderIndicator: FC<{ columnId: ColumnId }> = ({ columnId }) => {
  const { sort } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()

  if (!sort || columnId === undefined) return null

  if (sort.columnId !== columnId) {
    return (
      <OrderIndicatorContainer>
        <ArrowsUpDown color="white" />
      </OrderIndicatorContainer>
    )
  }

  if (sort.direction === 'asc') {
    return (
      <OrderIndicatorContainer>
        <ArrowUpWFill color="white" />
      </OrderIndicatorContainer>
    )
  }

  return (
    <OrderIndicatorContainer>
      <ArrowDownWFill color="white" />
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

const HeaderTitle: FC<ChildrenWithClassNameProps> = ({ children, className }) => (
  <Label variant="tag-s" className={cn('cursor-[inherit]', className)}>
    {children}
  </Label>
)

const HeaderSubtotal: FC<{ value: string }> = ({ value }) => (
  <Paragraph variant="body" bold className="mt-1 text-v3-text-100">
    {value}
  </Paragraph>
)

interface HeaderCellProps extends ChildrenWithClassNameProps {
  columnId: ColumnId
}

export const HeaderCell = ({ children, columnId, className }: HeaderCellProps): ReactElement | null => {
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
      contentClassName={cn('items-center', isJustifyCenter ? 'justify-center' : '')}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

export const DesktopHeaderRow = (): ReactElement => {
  const { rows } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()
  const visibleTotalAmountUsd = useTotalAmount(rows)

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
