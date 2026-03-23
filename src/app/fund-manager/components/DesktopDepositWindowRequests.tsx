'use client'

import { type Dispatch, memo, type ReactNode, Suspense, useCallback, useState } from 'react'

import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph, Span } from '@/components/Typography'
import { EXPLORER_URL, RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'

import type {
  ColumnId,
  DepositWindowCellDataMap,
  DepositWindowTable,
} from './DepositWindowRequestsTable.config'
import { COLUMN_TRANSFORMS, SORT_LABELS } from './DepositWindowRequestsTable.config'
import { StatusBadge } from './StatusBadge'

// ─── Header ──────────────────────────────────────────────────────────

interface ChildrenWithClassNameProps {
  children: ReactNode
  className?: string
}

const OrderIndicatorContainer = ({ children, className }: ChildrenWithClassNameProps) => (
  <div className={cn('flex justify-center gap-2', className)}>{children}</div>
)

const OrderIndicator = ({ columnId }: { columnId: ColumnId }) => {
  const { sort } = useTableContext<ColumnId, DepositWindowCellDataMap>()

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
  dispatch: Dispatch<DepositWindowTable['Action']>,
  columnId: ColumnId,
  currentSort: DepositWindowTable['State']['sort'],
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
  columnId: ColumnId
}

const HeaderCell = ({ children, columnId, className }: HeaderCellProps) => {
  const { sort, columns } = useTableContext<ColumnId, DepositWindowCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, DepositWindowCellDataMap>()
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
      data-testid={`deposit-window-header-cell-${columnId}`}
    >
      {isSortable && <OrderIndicator columnId={columnId} />}
      <TableHeaderNode className={isSortable ? 'cursor-pointer' : 'cursor-default'}>
        {children}
      </TableHeaderNode>
    </TableHeaderCell>
  )
}

const DepositWindowHeaderRow = () => (
  <Suspense fallback={<div>Loading table headers...</div>}>
    <thead>
      <tr
        className="flex border-b border-b-v3-text-60 select-none gap-4 pb-4 pl-4"
        data-testid="deposit-window-header-row"
      >
        <HeaderCell columnId="date">
          <HeaderTitle>{SORT_LABELS.date}</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="investor">
          <HeaderTitle>{SORT_LABELS.investor}</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="entity">
          <HeaderTitle>{SORT_LABELS.entity}</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="type">
          <HeaderTitle>{SORT_LABELS.type}</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="amount">
          <HeaderTitle>{SORT_LABELS.amount}</HeaderTitle>
        </HeaderCell>
        <HeaderCell columnId="status">
          <HeaderTitle>{SORT_LABELS.status}</HeaderTitle>
        </HeaderCell>
      </tr>
    </thead>
  </Suspense>
)

// ─── Data Row ────────────────────────────────────────────────────────

interface TableCellProps {
  columnId: ColumnId
  children?: ReactNode
  className?: string
}

const TableCell = ({ children, columnId, className }: TableCellProps) => {
  const { columns } = useTableContext<ColumnId, DepositWindowCellDataMap>()
  const column = columns.find(col => col.id === columnId)
  if (column?.hidden) return null

  return (
    <td
      className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
      data-testid={`deposit-window-cell-${columnId}`}
    >
      {children}
    </td>
  )
}

interface DataRowProps {
  row: DepositWindowTable['Row']
}

const DepositWindowDataRow = memo(({ row }: DataRowProps) => {
  const { data } = row
  const [isHovered, setIsHovered] = useState(false)
  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  const textColor = isHovered ? 'text-black' : 'text-v3-text-100'

  return (
    <tr
      className={cn(
        'flex border-b-v3-bg-accent-60 border-b gap-4 pl-4 py-3 min-h-[65px]',
        isHovered && 'bg-v3-text-100',
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="deposit-window-data-row"
    >
      <TableCell columnId="date">
        <Paragraph variant="body-s" className={textColor}>
          {data.date}
        </Paragraph>
      </TableCell>

      <TableCell columnId="investor">
        <a
          href={`${EXPLORER_URL}/address/${data.user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-v3-primary"
        >
          <Paragraph variant="body-s">{data.investor}</Paragraph>
        </a>
      </TableCell>

      <TableCell columnId="entity">
        <Paragraph variant="body-s" className={textColor}>
          {data.entity}
        </Paragraph>
      </TableCell>

      <TableCell columnId="type">
        <Paragraph variant="body" className={textColor}>
          {data.type}
        </Paragraph>
      </TableCell>

      <TableCell columnId="amount">
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center justify-items-center">
          <div className="text-right">
            <div>
              <Paragraph className={textColor}>{data.amount}</Paragraph>
            </div>
            <div>
              <Span variant="body-xs" className="text-text-40">
                {data.fiatAmount}
              </Span>
            </div>
          </div>
          <div className="flex flex-col items-start h-full justify-around gap-1">
            <TokenImage symbol={RBTC} size={16} />
            <Span variant="body-xs" className="text-text-40">
              USD
            </Span>
          </div>
        </div>
      </TableCell>

      <TableCell columnId="status">
        <StatusBadge status={data.status} />
      </TableCell>
    </tr>
  )
})

DepositWindowDataRow.displayName = 'DepositWindowDataRow'

// ─── Desktop Table ───────────────────────────────────────────────────

export const DesktopDepositWindowRequests = memo(() => {
  const { rows, error } = useTableContext<ColumnId, DepositWindowCellDataMap>()

  if (error) {
    return (
      <div className="w-full bg-v3-bg-accent-80 flex grow p-8 items-center justify-center">
        <Paragraph className="text-error" data-testid="deposit-window-error">
          {error}
        </Paragraph>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="w-full bg-v3-bg-accent-80 flex grow p-8 items-center justify-center">
        <Paragraph className="text-v3-text-secondary" data-testid="no-deposit-window-requests">
          No requests found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 block grow overflow-y-auto">
      <table className="w-full min-w-[700px]">
        <DepositWindowHeaderRow />
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody data-testid="deposit-window-table-body">
            {rows.map(row => (
              <DepositWindowDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
})

DesktopDepositWindowRequests.displayName = 'DesktopDepositWindowRequests'
