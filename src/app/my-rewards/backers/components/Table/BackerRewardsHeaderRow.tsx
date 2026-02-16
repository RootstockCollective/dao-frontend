'use client'

import { useTableActionsContext, useTableContext } from '@/shared/context'
import { ReactElement, Suspense } from 'react'

import { CombinedActionsHeaderCell, TableColumnDropdown } from '@/app/builders/components/Table'
import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIconKoto, KotoQuestionMarkIcon } from '@/components/Icons'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Tooltip, TooltipProps } from '@/components/Tooltip'
import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'
import { Dispatch, FC, ReactNode } from 'react'
import {
  BackerRewardsCellDataMap,
  BackerRewardsTable,
  COLUMN_TRANSFORMS,
  ColumnId,
  LABELS,
} from './BackerRewardsTable.config'

// TODO: extract common components with the builder table
const OrderIndicatorContainer: FC<CommonComponentProps> = ({ className, children }) => (
  <div className={cn('flex pt-1 justify-center gap-2', className)}>{children}</div>
)

const OrderIndicator: FC<CommonComponentProps & { columnId: BackerRewardsTable['Column']['id'] }> = ({
  columnId,
}) => {
  const { sort } = useTableContext<ColumnId, BackerRewardsCellDataMap>()

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
  dispatch: Dispatch<BackerRewardsTable['Action']>,
  columnId: ColumnId,
  currentSort: BackerRewardsTable['State']['sort'],
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

export const BackerHeaderCell = ({
  className,
  children,
  columnId,
  ...props
}: CommonComponentProps & { columnId: ColumnId }): ReactElement => {
  const { sort, columns } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()

  const isSortable = columns.find(({ id }) => id === columnId)?.sortable

  return (
    <TableHeaderCell
      className={cn(COLUMN_TRANSFORMS[columnId], className)}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
      {...props}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode>
        <HeaderTitle>Builder</HeaderTitle>
      </TableHeaderNode>
      {children}
    </TableHeaderCell>
  )
}

const QuestionTooltip = ({ className, ...props }: Omit<TooltipProps, 'children'>) => {
  return (
    <Tooltip
      className={cn('rounded-sm bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm', className)}
      {...props}
    >
      <KotoQuestionMarkIcon />
    </Tooltip>
  )
}

export const HeaderCell = ({
  className,
  children,
  columnId,
  tooltip,
  ...props
}: CommonComponentProps & {
  columnId: ColumnId
  tooltip?: Omit<TooltipProps, 'children'>
}): ReactNode => {
  const { sort, columns } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()

  const column = columns.find(({ id }) => id === columnId)

  if (!column || column.hidden) {
    return null
  }

  const isSortable = column.sortable

  // TODO: this is a temporary solution to justify center. Please do better than me ;)
  const columnClassNames = COLUMN_TRANSFORMS[columnId]
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

interface BackerRewardsHeaderRowProps {
  actions: Action[]
}
export const BackerRewardsHeaderRow = ({ actions }: BackerRewardsHeaderRowProps): ReactElement => {
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()
  const handleCancelActions = () => {
    dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
  }
  const actionCount = actions.length

  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="flex border-b-1 border-b-v3-text-60 select-none gap-4 pb-4 pl-4">
        <BackerHeaderCell key="builder" columnId="builder" />
        {actionCount <= 1 && (
          <>
            <HeaderCell key="backer_rewards" columnId="backer_rewards">
              <HeaderTitle>Backer Rewards</HeaderTitle>
              <HeaderSubtitle>%</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="unclaimed"
              columnId="unclaimed"
              tooltip={{
                text: 'Your rewards from each Builder available to claim',
                side: 'top',
                sideOffset: 10,
              }}
            >
              <HeaderTitle>Unclaimed</HeaderTitle>
            </HeaderCell>
            <HeaderCell
              key="estimated"
              columnId="estimated"
              tooltip={{
                text: (
                  <div className="flex flex-col gap-2 text-wrap max-w-[35rem]">
                    <Paragraph>
                      An estimate of the remainder of this Cycle&apos;s rewards from each Builder that will
                      become fully claimable by the end of the current Cycle. These rewards gradually
                      transition into your &apos;Claimable Rewards&apos; as the cycle progresses.
                    </Paragraph>
                    <Paragraph className="mt-2 mb-2">
                      To check the cycle`s completion, go to Collective Rewards → Current Cycle.
                    </Paragraph>
                    <Paragraph>
                      The displayed information is dynamic and may vary based on total rewards and user
                      activity. This data is for informational purposes only.
                    </Paragraph>
                  </div>
                ),
                side: 'top',
                sideOffset: 10,
              }}
            >
              <HeaderTitle>Estimated</HeaderTitle>
              <HeaderSubtitle>this cycle</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="total"
              columnId="total"
              tooltip={{
                text: 'The total of your received and claimable rewards for each Builder',
                side: 'top',
                sideOffset: 10,
              }}
            >
              <HeaderTitle>Total</HeaderTitle>
              <HeaderSubtitle>lifetime</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="backing" columnId="backing">
              <HeaderTitle>Backing</HeaderTitle>
            </HeaderCell>
            <HeaderCell columnId="actions">
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
