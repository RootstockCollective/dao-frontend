'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { Column, Sort, TableAction, useTableActionsContext, useTableContext } from '@/shared/context'
import { Dispatch, FC } from 'react'
import { COLUMN_WIDTHS, ColumnId, ColumnType } from './BuildersTable'
import { SelectorHeaderCell } from './SelectorHeaderCell'

const OrderIndicatorContainer: FC<CommonComponentProps> = ({ className, children }) => (
  <div className={cn('flex pt-1 justify-center gap-2', className)}>{children}</div>
)

const OrderIndicator: FC<CommonComponentProps & { column: Column['id'] }> = ({ column }) => {
  const { sort } = useTableContext<ColumnId, ColumnType>()

  if (!sort || column === undefined) return null

  if (sort.by !== column) {
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
const dispatchSortRoundRobin = <ColumnId extends Column['id']>(
  dispatch: Dispatch<TableAction<ColumnId>>,
  columnId: ColumnId,
  currentSort: Sort<ColumnId>,
) => {
  if (!currentSort || currentSort.by !== columnId) {
    dispatch({ type: 'SORT_BY_COLUMN', payload: { id: columnId, direction: 'desc' } })
    return
  }

  if (currentSort.direction === 'desc') {
    dispatch({ type: 'SORT_BY_COLUMN', payload: { id: columnId, direction: 'asc' } })
    return
  }

  dispatch({ type: 'SORT_BY_COLUMN', payload: { id: null, direction: null } })
}

const BuidlerHeaderCell: FC<CommonComponentProps & { columnId: ColumnId }> = ({
  className,
  children,
  columnId,
  ...props
}) => {
  const { sort } = useTableContext<ColumnId, ColumnType>()
  const dispatch = useTableActionsContext()

  return (
    <TableHeaderCell
      className={cn(COLUMN_WIDTHS[columnId], className)}
      onClick={() => dispatchSortRoundRobin(dispatch, columnId, sort)}
      {...props}
    >
      <OrderIndicator column={columnId} />
      <TableHeaderNode>{children}</TableHeaderNode>
    </TableHeaderCell>
  )
}

const HeaderTitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Label variant="tag" className={cn('text-v3-text-100', className)}>
    {children}
  </Label>
)
const HeaderSubtitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Paragraph variant="body-xs" className={cn('text-v3-bg-accent-40', className)}>
    {children}
  </Paragraph>
)

const getHeaderCells = () => ({
  builder: () => {
    const dispatch = useTableActionsContext()
    const { sort } = useTableContext<ColumnId, ColumnType>()

    return (
      <TableHeaderCell
        className={COLUMN_WIDTHS['builder']}
        onClick={() => dispatchSortRoundRobin(dispatch, 'builder', sort)}
      >
        <SelectorHeaderCell />
        <OrderIndicator column="builder" />
        <TableHeaderNode>
          <HeaderTitle>Builder</HeaderTitle>
        </TableHeaderNode>
      </TableHeaderCell>
    )
  },
  backing: () => (
    <BuidlerHeaderCell key="backing" columnId="backing">
      <HeaderTitle>Backing</HeaderTitle>
    </BuidlerHeaderCell>
  ),
  rewards_percentage: () => (
    <BuidlerHeaderCell key="rewards_percentage" columnId="rewards_percentage">
      <HeaderTitle>Rewards</HeaderTitle>
      <HeaderSubtitle>%</HeaderSubtitle>
    </BuidlerHeaderCell>
  ),
  rewards_past_cycle: () => (
    <BuidlerHeaderCell key="rewards_past_cycle" columnId="rewards_past_cycle">
      <HeaderTitle>Rewards</HeaderTitle>
      <HeaderSubtitle>past cycle</HeaderSubtitle>
    </BuidlerHeaderCell>
  ),
  rewards_upcoming: () => (
    <BuidlerHeaderCell key="rewards_upcoming" columnId="rewards_upcoming">
      <HeaderTitle>Rewards</HeaderTitle>
      <HeaderSubtitle>upcoming cycle, estimated</HeaderSubtitle>
    </BuidlerHeaderCell>
  ),
  allocations: () => (
    <BuidlerHeaderCell key="allocations" columnId="allocations">
      <HeaderTitle>Allocations</HeaderTitle>
      <HeaderSubtitle>Total</HeaderSubtitle>
    </BuidlerHeaderCell>
  ),
  actions: () => (
    <BuidlerHeaderCell columnId="actions">
      <HeaderTitle>Actions</HeaderTitle>
    </BuidlerHeaderCell>
  ),
})

const renderHeaderCells = (
  columns: Column<ColumnId, ColumnType>[],
  headerConfigs: ReturnType<typeof getHeaderCells>,
) => {
  return columns.map(({ id, hidden }) => {
    if (hidden) return null

    const headerConfig = headerConfigs[id as keyof typeof headerConfigs]
    return headerConfig ? headerConfig() : null
  })
}

export const BuilderHeaderRow: FC<CommonComponentProps & { columns: Column<ColumnId, ColumnType>[] }> = ({
  columns,
}) => {
  const headerConfigs = getHeaderCells()
  const headers = renderHeaderCells(columns, headerConfigs)

  return <tr className="capitalize text-xs leading-4 flex border-b-1 border-b-v3-text-60">{headers}</tr>
}
