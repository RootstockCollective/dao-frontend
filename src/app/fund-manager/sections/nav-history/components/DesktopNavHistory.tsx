'use client'

import { type Dispatch, memo, type ReactNode, Suspense } from 'react'

import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'

import type { NavColumnId, NavHistoryCellDataMap, NavHistoryTable } from '../config'
import { COLUMN_TRANSFORMS, SORT_LABELS } from '../config'

// ─── Header ──────────────────────────────────────────────────────────

interface ChildrenWithClassNameProps {
  children: ReactNode
  className?: string
}

const OrderIndicatorContainer = ({ children, className }: ChildrenWithClassNameProps) => (
  <div className={cn('flex justify-center gap-2', className)}>{children}</div>
)

const OrderIndicator = ({ columnId }: { columnId: NavColumnId }) => {
  const { sort } = useTableContext<NavColumnId, NavHistoryCellDataMap>()

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
  dispatch: Dispatch<NavHistoryTable['Action']>,
  columnId: NavColumnId,
  currentSort: NavHistoryTable['State']['sort'],
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

const HeaderTitle = ({ children, className }: ChildrenWithClassNameProps) => (
  <Label variant="tag-s" className={cn('cursor-[inherit]', className)}>
    {children}
  </Label>
)

interface HeaderCellProps extends ChildrenWithClassNameProps {
  columnId: NavColumnId
}

const HeaderCell = ({ children, columnId, className }: HeaderCellProps) => {
  const { sort, columns } = useTableContext<NavColumnId, NavHistoryCellDataMap>()
  const dispatch = useTableActionsContext<NavColumnId, NavHistoryCellDataMap>()
  const column = columns.find(({ id }) => id === columnId)
  if (!column || column.hidden) return null

  const isSortable = column.sortable
  const columnClassNames = COLUMN_TRANSFORMS[columnId]
  const isJustifyCenter = columnClassNames?.match('justify-center')?.length ?? false

  return (
    <TableHeaderCell
      className={cn('h-full', columnClassNames, className)}
      contentClassName={cn('items-center', isJustifyCenter ? 'justify-center' : '')}
      onClick={() => isSortable && dispatchSortRoundRobin(dispatch, columnId, sort)}
      data-testid={`nav-history-header-cell-${columnId}`}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

const NavHistoryHeaderRow = () => (
  <thead>
    <tr
      className="flex border-b border-b-v3-text-60 select-none gap-4 pb-4 pl-4"
      data-testid="nav-history-header-row"
    >
      <HeaderCell columnId="reportedOffchainAssets">
        <HeaderTitle>{SORT_LABELS.reportedOffchainAssets}</HeaderTitle>
      </HeaderCell>
      <HeaderCell columnId="requestsProcessedInEpoch">
        <HeaderTitle>{SORT_LABELS.requestsProcessedInEpoch}</HeaderTitle>
      </HeaderCell>
      <HeaderCell columnId="processedAt">
        <HeaderTitle>{SORT_LABELS.processedAt}</HeaderTitle>
      </HeaderCell>
    </tr>
  </thead>
)

// ─── Data Row ────────────────────────────────────────────────────────

interface TableCellProps {
  columnId: NavColumnId
  children?: ReactNode
  className?: string
}

const TableCell = ({ children, columnId, className }: TableCellProps) => {
  const { columns } = useTableContext<NavColumnId, NavHistoryCellDataMap>()
  const column = columns.find(col => col.id === columnId)
  if (column?.hidden) return null

  return (
    <td
      className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
      data-testid={`nav-history-cell-${columnId}`}
    >
      {children}
    </td>
  )
}

const NavHistoryDataRow = ({
  reportedOffchainAssets,
  fiatAmountFormatted,
  requestsProcessedInEpoch,
  processedAt,
}: NavHistoryCellDataMap) => (
  <tr
    className={'flex border-b-v3-bg-accent-60 border-b gap-4 pl-4 py-3 min-h-[65px]'}
    data-testid="nav-history-data-row"
  >
    <TableCell columnId="reportedOffchainAssets" className="justify-center">
      <div>
        <div className="flex items-center gap-1">
          <Paragraph className={'text-v3-text-100'}>{reportedOffchainAssets}</Paragraph>
          <TokenImage symbol={RBTC} size={16} />
        </div>
        {fiatAmountFormatted && (
          <Span variant="body-xs" className="text-text-40">
            {fiatAmountFormatted}
          </Span>
        )}
      </div>
    </TableCell>

    <TableCell columnId="requestsProcessedInEpoch">
      <Paragraph variant="body-s" className={'text-v3-text-100'}>
        {requestsProcessedInEpoch}
      </Paragraph>
    </TableCell>

    <TableCell columnId="processedAt">
      <Paragraph variant="body-s" className={'text-v3-text-100'}>
        {processedAt}
      </Paragraph>
    </TableCell>
  </tr>
)

NavHistoryDataRow.displayName = 'NavHistoryDataRow'

// ─── Desktop Table ───────────────────────────────────────────────────

interface DesktopNavHistoryProps {
  isLoading: boolean
}

export const DesktopNavHistory = memo(({ isLoading }: DesktopNavHistoryProps) => {
  const { rows, error } = useTableContext<NavColumnId, NavHistoryCellDataMap>()

  if (error) {
    return (
      <div className="w-full bg-v3-bg-accent-80 flex grow p-8 items-center justify-center">
        <Paragraph className="text-error" data-testid="nav-history-error">
          {error}
        </Paragraph>
      </div>
    )
  }

  if (rows.length === 0) {
    if (isLoading) {
      return (
        <div
          className="w-full bg-v3-bg-accent-80 flex grow p-8 min-h-[180px] items-center justify-center"
          data-testid="nav-history-loading"
        >
          <LoadingSpinner />
        </div>
      )
    }
    return (
      <div className="w-full bg-v3-bg-accent-80 flex grow p-8 items-center justify-center">
        <Paragraph className="text-v3-text-secondary" data-testid="no-nav-history">
          No NAV history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 block grow overflow-y-auto">
      <table className="w-full min-w-[700px]">
        <NavHistoryHeaderRow />
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody data-testid="nav-history-table-body">
            {rows.map(row => (
              <NavHistoryDataRow key={row.id} {...row.data} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
})

DesktopNavHistory.displayName = 'DesktopNavHistory'
