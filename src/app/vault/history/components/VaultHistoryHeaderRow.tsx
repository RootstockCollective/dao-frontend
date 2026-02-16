'use client'

import { useTableActionsContext, useTableContext } from '@/shared/context'
import { ReactNode, Suspense } from 'react'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'
import { Dispatch } from 'react'
import {
  VaultHistoryCellDataMap,
  VaultHistoryTable,
  COLUMN_TRANSFORMS,
  COLUMN_CONTENT_ALIGN,
  ColumnId,
  useVaultHistoryTable,
} from './VaultHistoryTable.config'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'

interface OrderIndicatorContainerProps {
  children: ReactNode
  className?: string
}

const OrderIndicatorContainer = ({ className, children }: OrderIndicatorContainerProps) => (
  <div className={cn('flex pt-1 justify-center gap-2', className)} data-testid="VaultHistoryOrderIndicator">
    {children}
  </div>
)

interface OrderIndicatorProps {
  columnId: ColumnId
}

const OrderIndicator = ({ columnId }: OrderIndicatorProps) => {
  const { sort } = useTableContext<ColumnId, VaultHistoryCellDataMap>()

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
  dispatch: Dispatch<VaultHistoryTable['Action']>,
  columnId: ColumnId,
  currentSort: VaultHistoryTable['State']['sort'],
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

interface HeaderTitleProps {
  children: ReactNode
  className?: string
}

const HeaderTitle = ({ className, children }: HeaderTitleProps) => (
  <Label variant="tag-s" className={cn('cursor-[inherit]', className)}>
    {children}
  </Label>
)

interface HeaderCellProps {
  children: ReactNode
  columnId: ColumnId
  className?: string
}

export const HeaderCell = ({ className, children, columnId }: HeaderCellProps) => {
  const { sort, columns } = useTableContext<ColumnId, VaultHistoryCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, VaultHistoryCellDataMap>()

  const column = columns.find(({ id }) => id === columnId)

  if (!column || column.hidden) {
    return null
  }

  const isSortable = column.sortable
  const columnClassNames = COLUMN_TRANSFORMS[columnId]
  const contentAlign = COLUMN_CONTENT_ALIGN[columnId]

  return (
    <TableHeaderCell
      className={cn('h-full', columnClassNames, contentAlign, className)}
      contentClassName={contentAlign ?? ''}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
      data-testid={`VaultHistoryHeaderCell${columnId}`}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

export const VaultHistoryHeaderRow = () => {
  const { totalAmount } = useVaultHistoryTable()

  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <thead>
        <tr
          className={cn(
            'flex select-none gap-4 pb-2 pl-4',
            totalAmount === null && 'border-b-1 border-b-v3-text-60',
          )}
          data-testid="VaultHistoryHeaderRow"
        >
          <HeaderCell columnId="period">
            <HeaderTitle>Date</HeaderTitle>
          </HeaderCell>
          <HeaderCell columnId="action">
            <HeaderTitle>Type</HeaderTitle>
          </HeaderCell>
          <HeaderCell columnId="assets">
            <HeaderTitle>Amount</HeaderTitle>
          </HeaderCell>
          <HeaderCell columnId="total_usd">
            <HeaderTitle>Total amount (USD)</HeaderTitle>
          </HeaderCell>
          <HeaderCell columnId="actions">
            <HeaderTitle>Actions</HeaderTitle>
          </HeaderCell>
        </tr>
        {totalAmount !== null && (
          <tr
            className="flex gap-4 pl-4 pb-2 border-b-1 border-b-v3-text-60"
            data-testid="VaultHistoryTotalSummaryRow"
          >
            <th className={COLUMN_TRANSFORMS.period} />
            <th className={COLUMN_TRANSFORMS.action} />
            <th className={COLUMN_TRANSFORMS.assets} />
            <th
              className={cn(COLUMN_TRANSFORMS.total_usd, COLUMN_CONTENT_ALIGN.total_usd, 'flex items-center')}
            >
              <Paragraph
                variant="body"
                className="text-v3-text-100 font-bold"
                data-testid="VaultHistoryTotalAmount"
              >
                {totalAmount}
              </Paragraph>
            </th>
            <th className={COLUMN_TRANSFORMS.actions} />
          </tr>
        )}
      </thead>
    </Suspense>
  )
}
