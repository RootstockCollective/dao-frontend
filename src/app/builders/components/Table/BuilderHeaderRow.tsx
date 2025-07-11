'use client'

import { Column, Sort, TableAction, useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTIONS } from '@/shared/context/TableContext/types'
import { Suspense } from 'react'

import { CommonComponentProps } from '@/components/commonProps'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { Dispatch, FC } from 'react'
import { COLUMN_TRANFORMS, ColumnId } from './BuilderTable.config'
import { SelectorHeaderCell } from './Cell/SelectorHeaderCell/SelectorHeaderCell'
import { TableColumnDropdown } from './TableColumnDropdown'

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

const BuilderHeaderCell: FC<CommonComponentProps & { columnId: ColumnId }> = ({
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
      className={cn(COLUMN_TRANFORMS[columnId], className)}
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

const HeaderCell: FC<CommonComponentProps & { columnId: ColumnId }> = ({
  className,
  children,
  columnId,
  ...props
}) => {
  const { sort, columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext()

  const column = columns.find(({ id }) => id === columnId)

  if (!column || column.hidden) {
    return null
  }

  const isSortable = column.sortable

  // TODO: this is a temporary solution to justify center. Please do better than me ;)
  const columnClassNames = COLUMN_TRANFORMS[columnId]
  const isJustifyCenter = columnClassNames?.match('justify-center')?.length ?? false

  return (
    <>
      <TableHeaderCell
        className={cn(columnClassNames, className)}
        contentClassName={isJustifyCenter ? 'justify-center' : ''}
        onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
        {...props}
      >
        {isSortable && <OrderIndicator columnId={columnId} />}
        <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
          {children}
        </TableHeaderNode>
      </TableHeaderCell>
    </>
  )
}

const HeaderTitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Label
    variant="tag"
    className={cn(
      'text-v3-text-100 cursor-[inherit] rootstock-sans text-[0.875rem] leading-5 font-normal',
      className,
    )}
  >
    {children}
  </Label>
)
const HeaderSubtitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Paragraph
    variant="body-xs"
    className={cn('text-v3-bg-accent-40 rootstock-sans text-xs leading-5 lowercase font-normal', className)}
  >
    {children}
  </Paragraph>
)

export const BuilderHeaderRow = () => {
  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="flex border-b-1 border-b-v3-text-60 select-none gap-4">
        <BuilderHeaderCell key="builder" columnId="builder" />
        <HeaderCell key="backer_rewards" columnId="backer_rewards">
          <HeaderTitle>Backer Rewards</HeaderTitle>
          <HeaderSubtitle>current % - change</HeaderSubtitle>
        </HeaderCell>
        <HeaderCell key="rewards_past_cycle" columnId="rewards_past_cycle">
          <HeaderTitle>Rewards</HeaderTitle>
          <HeaderSubtitle>past cycle</HeaderSubtitle>
        </HeaderCell>
        <HeaderCell key="rewards_upcoming" columnId="rewards_upcoming">
          <HeaderTitle>Rewards</HeaderTitle>
          <HeaderSubtitle>upcoming cycle, estimated</HeaderSubtitle>
        </HeaderCell>
        <HeaderCell key="backing" columnId="backing">
          <HeaderTitle>Backing</HeaderTitle>
          <HeaderSubtitle className="h-full text-v3-bg-accent-80">balls</HeaderSubtitle>{' '}
          {/* TODO: temporary fix to align the text to the top */}
        </HeaderCell>
        <HeaderCell key="allocations" columnId="allocations">
          <HeaderTitle>Backing Share</HeaderTitle>
          <HeaderSubtitle>%</HeaderSubtitle>
        </HeaderCell>
        <HeaderCell columnId="actions">
          <HeaderTitle>Actions</HeaderTitle>
          <HeaderSubtitle className="h-full text-v3-bg-accent-80">balls</HeaderSubtitle>{' '}
          {/* TODO: temporary fix to align the text to the top */}
        </HeaderCell>
        <TableColumnDropdown className="self-start" />
      </tr>
    </Suspense>
  )
}
