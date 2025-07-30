'use client'

import { Column, Sort, TableAction, useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/types'
import { ReactElement, Suspense } from 'react'

import { Button } from '@/components/ButtonNew/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIconKoto, KotoQuestionMarkIcon } from '@/components/Icons'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Tooltip, TooltipProps } from '@/components/Tooltip'
import { Label, Paragraph, Span } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { redirect, RedirectType } from 'next/navigation'
import { Dispatch, FC, ReactNode } from 'react'
import { Address } from 'viem'
import { COLUMN_TRANSFORMS, ColumnId, ColumnTransforms, LABELS } from './BuilderTable.config'
import { Action, ActionCell } from './Cell/ActionCell'
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
const dispatchSortRoundRobin = <ColumnId extends string>(
  dispatch: Dispatch<TableAction<ColumnId>>,
  columnId: ColumnId,
  currentSort: Sort<ColumnId>,
) => {
  // If the column is different, we want to sort by the column in ascending order.
  const isSameColumn = currentSort.columnId === columnId
  if (!isSameColumn) {
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId, direction: SORT_DIRECTION_ASC } })
    return
  }
  // If the column is the same as the current sort, we want to toggle the sort direction.
  const currentSortIndex = SORT_DIRECTIONS.indexOf(currentSort.direction)
  const nextSortIndex = (currentSortIndex + 1) % SORT_DIRECTIONS.length
  const nextSort = SORT_DIRECTIONS[nextSortIndex]

  dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: nextSort ? columnId : null, direction: nextSort } })
}

export const BuilderHeaderCellBase = <ColumnId extends string>({
  className,
  columnId,
  columnTransforms,
  ...props
}: CommonComponentProps & {
  columnId: ColumnId
  columnTransforms: ColumnTransforms<ColumnId>
}): ReactElement => {
  const { sort, columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext()

  const isSortable = columns.find(({ id }) => id === columnId)?.sortable

  return (
    <TableHeaderCell
      className={cn(columnTransforms[columnId], className)}
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

export const BuilderHeaderCell = ({
  className,
  children,
  columnId,
  ...props
}: CommonComponentProps & { columnId: ColumnId }): ReactElement => {
  return (
    <BuilderHeaderCellBase<ColumnId>
      className={className}
      columnId={columnId}
      columnTransforms={COLUMN_TRANSFORMS}
      {...props}
    >
      {children}
    </BuilderHeaderCellBase>
  )
}

const QuestionTooltip = ({ className, ...props }: Omit<TooltipProps, 'children'>) => {
  return (
    <Tooltip
      className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm', className)}
      {...props}
    >
      <KotoQuestionMarkIcon />
    </Tooltip>
  )
}

export const HeaderCell = <ColumnId extends string>({
  className,
  children,
  columnId,
  columnTransforms,
  tooltip,
  ...props
}: CommonComponentProps & {
  columnId: ColumnId
  columnTransforms: ColumnTransforms<ColumnId>
  tooltip?: Omit<TooltipProps, 'children'>
}): ReactNode => {
  const { sort, columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext()

  const column = columns.find(({ id }) => id === columnId)

  if (!column || column.hidden) {
    return null
  }

  const isSortable = column.sortable

  // TODO: this is a temporary solution to justify center. Please do better than me ;)
  const columnClassNames = columnTransforms[columnId]
  const isJustifyCenter = columnClassNames?.match('justify-center')?.length ?? false

  return (
    <>
      <TableHeaderCell
        className={cn('h-full', columnClassNames, className)}
        contentClassName={isJustifyCenter ? 'justify-center' : ''}
        onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
        {...props}
      >
        {isSortable && <OrderIndicator columnId={columnId} />}
        <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
          {children}
        </TableHeaderNode>
        {tooltip && <QuestionTooltip {...tooltip} />}
      </TableHeaderCell>
    </>
  )
}

export const HeaderTitle: FC<CommonComponentProps> = ({ className, children }) => (
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

export const HeaderSubtitle: FC<CommonComponentProps> = ({ className, children }) => (
  <Paragraph
    variant="body-xs"
    className={cn('text-v3-bg-accent-40 rootstock-sans text-xs leading-5 lowercase font-normal', className)}
  >
    {children}
  </Paragraph>
)

export type BuilderHeaderRowProps = {
  actions: Action[]
}
export const BuilderHeaderRow = ({ actions }: BuilderHeaderRowProps): ReactElement => {
  const dispatch = useTableActionsContext()
  const handleCancelActions = () => {
    dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
  }
  const actionCount = actions.length

  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="flex border-b-1 border-b-v3-text-60 select-none gap-4 pb-4">
        <BuilderHeaderCell key="builder" columnId="builder" />
        {actionCount <= 1 && (
          <>
            <HeaderCell key="backer_rewards" columnId="backer_rewards" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Backer Rewards</HeaderTitle>
              <HeaderSubtitle>current % - change</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="rewards_past_cycle"
              columnId="rewards_past_cycle"
              columnTransforms={COLUMN_TRANSFORMS}
            >
              <HeaderTitle>Rewards</HeaderTitle>
              <HeaderSubtitle>past cycle</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="rewards_upcoming"
              columnId="rewards_upcoming"
              columnTransforms={COLUMN_TRANSFORMS}
            >
              <HeaderTitle>Rewards</HeaderTitle>
              <HeaderSubtitle>upcoming cycle, estimated</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="backing" columnId="backing" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Backing</HeaderTitle>
            </HeaderCell>
            <HeaderCell key="allocations" columnId="allocations" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Backing Share</HeaderTitle>
              <HeaderSubtitle>%</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell columnId="actions" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Actions</HeaderTitle>
            </HeaderCell>
            <th>
              <TableColumnDropdown<Exclude<ColumnId, 'builder' | 'actions'>>
                className="self-start"
                labels={LABELS}
              />
            </th>
          </>
        )}
        {actionCount > 1 && (
          <>
            <CombinedActionsHeaderCell actions={actions} />
            <TableHeaderCell contentClassName="items-start">
              <Button
                variant="secondary"
                className="p-0 border-none bg-inherit"
                onClick={handleCancelActions}
              >
                <CloseIconKoto className="w-5 h-5 text-v3-text-100" />
              </Button>
            </TableHeaderCell>
          </>
        )}
      </tr>
    </Suspense>
  )
}

interface CombinedActionsHeaderCellProps extends CommonComponentProps<HTMLButtonElement> {
  actions: Action[]
}
export const CombinedActionsHeaderCell = ({ actions }: CombinedActionsHeaderCellProps): ReactElement => {
  const { selectedRows } = useTableContext<ColumnId>()

  const isMultipleDifferentActions = actions.some(action => action !== actions[0])
  const showAction = isMultipleDifferentActions ? 'adjustBacking' : actions[0]

  const handleClick = () => {
    const selectedBuilderIds = Object.keys(selectedRows) as Address[]

    redirect(`/backing?builders=${selectedBuilderIds.join(',')}`, RedirectType.push)
  }

  return (
    <TableHeaderCell>
      <TableHeaderNode>
        <HeaderTitle className="flex flex-row gap-2">
          <ActionCell
            actionType={showAction}
            onClick={handleClick}
            className="flex justify-center items-center gap-1 font-rootstock-sans border-0 text-v3-text-100 font-light p-[inherit] h-[inherit] w-[inherit]"
          />
          <Span variant="tag-s" className="text-v3-bg-accent-0">
            {actions.length}
          </Span>
        </HeaderTitle>
      </TableHeaderNode>
    </TableHeaderCell>
  )
}
