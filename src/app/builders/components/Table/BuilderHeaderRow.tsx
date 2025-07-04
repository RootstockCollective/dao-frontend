'use client'

import { Column, Sort, TableAction, useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTIONS } from '@/shared/context/TableContext/types'
import { HtmlHTMLAttributes, Suspense } from 'react'

import { CommonComponentProps } from '@/components/commonProps'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { Dispatch, FC } from 'react'
import { ColumnId } from './BuilderTable.types'
import { SelectorHeaderCell } from './Cell/SelectorHeaderCell/SelectorHeaderCell'

// FIXME: Leave to the end to fix the dynamic width of the columns so that the actions column expands when other columns are hidden without affecting the builder column.
export const COLUMN_WIDTHS: Record<ColumnId, HtmlHTMLAttributes<HTMLTableCellElement>['className']> = {
  builder: 'grow-3 shrink-2 basis-6 pl-4',
  backing: 'grow-1 shrink-1 basis-6 pl-4',
  backer_rewards: 'grow-1 shrink-1 basis-6 pl-4',
  rewards_past_cycle: 'grow-1 shrink-1 basis-6 pl-4',
  rewards_upcoming: 'grow-1 shrink-1 basis-6 pl-4',
  allocations: 'grow-1 shrink-0 basis-6 pl-4',
  actions: 'grow-1 shrink-0 basis-6 pl-4',
}
const OrderIndicatorContainer: FC<CommonComponentProps> = ({ className, children }) => (
  <div className={cn('flex pt-1 justify-center gap-2', className)}>{children}</div>
)

const OrderIndicator: FC<CommonComponentProps & { columnId: Column['id'] }> = ({ columnId }) => {
  const { sort } = useTableContext<ColumnId>()

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

/**
 * Dispatch a round robin based sort.
 * If the column is not sorted, sort it descending.
 * If the column is sorted and descending, sort it ascending.
 * If the column is sorted and ascending, stop sorting.
 * @param dispatch - The dispatch function to dispatch the sort action.
 * @param columnId - The column id to sort.
 * @param currentSort - The current sort state.
 */
const dispatchSortRoundRobin = (
  dispatch: Dispatch<TableAction<ColumnId>>,
  columnId: ColumnId,
  currentSort: Sort<ColumnId>,
) => {
  const currentSortIndex = SORT_DIRECTIONS.indexOf(currentSort.direction)
  const nextSortIndex = (currentSortIndex + 1) % SORT_DIRECTIONS.length
  const nextSort = SORT_DIRECTIONS[nextSortIndex]

  dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: nextSort ? columnId : null, direction: nextSort } })
}

const BuilderSelectorHeaderCell: FC<CommonComponentProps & { columnId: ColumnId }> = ({
  className,
  children,
  columnId,
  ...props
}) => {
  const { sort, columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext()

  const isSortable = columns.find(({ id }) => id === columnId)?.sortable

  return (
    <TableHeaderCell
      className={cn(COLUMN_WIDTHS[columnId], className)}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
      {...props}
    >
      <SelectorHeaderCell />
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode>
        <HeaderTitle>Builder</HeaderTitle>
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

const BuilderHeaderCell: FC<CommonComponentProps & { columnId: ColumnId }> = ({
  className,
  children,
  columnId,
  ...props
}) => {
  const { sort, columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext()

  const column = columns.find(({ id }) => id === columnId)

  if (!column || column.hidden) return null

  const isSortable = column.sortable

  return (
    <TableHeaderCell
      className={cn(COLUMN_WIDTHS[columnId], className)}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
      {...props}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

const HeaderTitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Label variant="tag" className={cn('text-v3-text-100 cursor-[inherit]', className)}>
    {children}
  </Label>
)
const HeaderSubtitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Paragraph variant="body-xs" className={cn('text-v3-bg-accent-40', className)}>
    {children}
  </Paragraph>
)

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  {
    id: 'builder',
    hidden: false,
    sortable: true,
  },
  {
    id: 'backer_rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'backing',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_past_cycle',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_upcoming',
    hidden: false,
    sortable: true,
  },
  {
    id: 'allocations',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    hidden: true,
    sortable: false,
  },
]

export const BuilderHeaderRow = () => {
  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="capitalize text-xs leading-4 flex border-b-1 border-b-v3-text-60 select-none">
        <BuilderSelectorHeaderCell key="builder" columnId="builder" />
        <BuilderHeaderCell key="backing" columnId="backing">
          <HeaderTitle>Backing</HeaderTitle>
        </BuilderHeaderCell>
        <BuilderHeaderCell key="backer_rewards" columnId="backer_rewards">
          <HeaderTitle>Rewards</HeaderTitle>
          <HeaderSubtitle>%</HeaderSubtitle>
        </BuilderHeaderCell>
        <BuilderHeaderCell key="rewards_past_cycle" columnId="rewards_past_cycle">
          <HeaderTitle>Rewards</HeaderTitle>
          <HeaderSubtitle>past cycle</HeaderSubtitle>
        </BuilderHeaderCell>
        <BuilderHeaderCell key="rewards_upcoming" columnId="rewards_upcoming">
          <HeaderTitle>Rewards</HeaderTitle>
          <HeaderSubtitle>upcoming cycle, estimated</HeaderSubtitle>
        </BuilderHeaderCell>
        <BuilderHeaderCell key="allocations" columnId="allocations">
          <HeaderTitle>Allocations</HeaderTitle>
          <HeaderSubtitle>Total</HeaderSubtitle>
        </BuilderHeaderCell>
        <BuilderHeaderCell columnId="actions">
          <HeaderTitle>Actions</HeaderTitle>
        </BuilderHeaderCell>
      </tr>
    </Suspense>
  )
}
