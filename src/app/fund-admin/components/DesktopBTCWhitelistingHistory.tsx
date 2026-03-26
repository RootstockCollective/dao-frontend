'use client'

import { type Dispatch, type FocusEvent, type ReactElement, useState } from 'react'

import { DESKTOP_ROW_STYLES } from '@/app/builders/components/Table/utils/builderRowUtils'
import { DeWhitelistIcon } from '@/components/Icons/DeWhitelistIcon'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TableHeaderCell, TableHeaderNode } from '@/components/TableNew'
import { Label, Paragraph } from '@/components/Typography'
import { EXPLORER_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { SORT_DIRECTION_ASC, SORT_DIRECTIONS } from '@/shared/context/TableContext/constants'

import {
  COLUMN_TRANSFORMS,
  type ColumnId,
  SORT_LABELS,
  type VisibleColumnId,
  type WhitelistCellDataMap,
  type WhitelistStatus,
  type WhitelistTable,
} from './BTCWhitelistingHistoryTable.config'

interface ChildrenWithClassNameProps {
  children: React.ReactNode
  className?: string
}

interface OrderIndicatorProps {
  columnId: ColumnId
}

function OrderIndicator({ columnId }: OrderIndicatorProps) {
  const { sort } = useTableContext<ColumnId, WhitelistCellDataMap>()

  if (!sort || columnId === undefined) return null

  if (sort.columnId !== columnId) {
    return (
      <div className="flex justify-center gap-2">
        <ArrowsUpDown color="white" />
      </div>
    )
  }

  if (sort.direction === 'asc') {
    return (
      <div className="flex justify-center gap-2">
        <ArrowUpWFill color="white" />
      </div>
    )
  }

  return (
    <div className="flex justify-center gap-2">
      <ArrowDownWFill color="white" />
    </div>
  )
}

const dispatchSortRoundRobin = (
  dispatch: Dispatch<WhitelistTable['Action']>,
  columnId: ColumnId,
  currentSort: WhitelistTable['State']['sort'],
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

const HeaderCell = ({ children, columnId, className }: HeaderCellProps): ReactElement | null => {
  const { sort, columns } = useTableContext<ColumnId, WhitelistCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, WhitelistCellDataMap>()

  const column = columns.find(({ id }) => id === columnId)
  if (!column || column.hidden) return null

  const isSortable = column.sortable
  const columnClassNames = COLUMN_TRANSFORMS[columnId]
  const isJustifyCenter = columnClassNames?.includes('justify-center')

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

const VISIBLE_COLUMN_IDS: VisibleColumnId[] = ['address', 'institution', 'date', 'status']

const WhitelistHeaderRow = (): ReactElement => (
  <tr className="flex border-b border-b-v3-text-60 select-none gap-4 pb-4 pl-4">
    {VISIBLE_COLUMN_IDS.map(id => (
      <HeaderCell key={id} columnId={id}>
        <HeaderTitle>{SORT_LABELS[id]}</HeaderTitle>
      </HeaderCell>
    ))}
  </tr>
)

const STATUS_STYLES: Record<WhitelistStatus, string> = {
  Whitelisted: 'bg-success text-black',
  'De-whitelisted': 'bg-error text-foreground',
}

interface TableCellProps {
  columnId: ColumnId
  children: React.ReactNode
  className?: string
  forceShow?: boolean
}

function TableCell({ columnId, children, className, forceShow }: TableCellProps) {
  const { columns } = useTableContext<ColumnId, WhitelistCellDataMap>()
  const column = columns.find(({ id }) => id === columnId)

  // Match builders TableCellBase: no <td> when column hidden unless forceShow — zero layout space
  if (!forceShow && column?.hidden) return null

  const columnClassNames = COLUMN_TRANSFORMS[columnId]
  return (
    <td className={cn('flex self-stretch items-center select-none', columnClassNames, className)}>
      {children}
    </td>
  )
}

interface DataRowProps {
  row: WhitelistTable['Row']
  onAction?: (address: string) => void
}

function WhitelistDataRow({ row, onAction }: DataRowProps) {
  const { data } = row
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const isRowActive = isHovered || isFocusWithin

  const showActionInsteadOfStatus = !!(isRowActive && onAction && data.status === 'Whitelisted')

  const handleRowFocus = () => {
    setIsFocusWithin(true)
  }

  const handleRowBlur = (e: FocusEvent<HTMLTableRowElement>) => {
    const next = e.relatedTarget as Node | null
    if (next && e.currentTarget.contains(next)) return
    setIsFocusWithin(false)
  }

  return (
    <tr
      className={cn(
        DESKTOP_ROW_STYLES.base,
        'py-3 min-h-[65px]',
        isRowActive
          ? showActionInsteadOfStatus
            ? DESKTOP_ROW_STYLES.selected
            : DESKTOP_ROW_STYLES.unselected
          : DESKTOP_ROW_STYLES.unselected,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleRowFocus}
      onBlur={handleRowBlur}
    >
      <TableCell columnId="address">
        <a
          href={`${EXPLORER_URL}/address/${data.fullAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-1 text-v3-primary',
            isRowActive && showActionInsteadOfStatus && 'text-v3-bg-accent-100',
          )}
        >
          <Paragraph variant="body-l">{data.address}</Paragraph>
        </a>
      </TableCell>
      <TableCell columnId="institution">
        <Paragraph
          variant="body-l"
          className={isRowActive && showActionInsteadOfStatus ? 'text-v3-bg-accent-100' : undefined}
        >
          {data.institution}
        </Paragraph>
      </TableCell>
      <TableCell columnId="date">
        <Paragraph
          variant="body-s"
          className={isRowActive && showActionInsteadOfStatus ? 'text-v3-bg-accent-100' : undefined}
        >
          {data.date}
        </Paragraph>
      </TableCell>
      {showActionInsteadOfStatus ? (
        <TableCell columnId="actions" forceShow>
          <button
            type="button"
            aria-label="De-whitelist address"
            onClick={e => {
              e.stopPropagation()
              onAction?.(data.fullAddress)
            }}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity font-rootstock-sans"
          >
            <DeWhitelistIcon size={20} color="currentColor" className="shrink-0" aria-hidden />
            <span>De-whitelist address</span>
          </button>
        </TableCell>
      ) : (
        <TableCell columnId="status">
          <span className={cn('px-3 py-1.5 rounded-full text-xs', STATUS_STYLES[data.status])}>
            {data.status}
          </span>
        </TableCell>
      )}
    </tr>
  )
}

interface DesktopBTCWhitelistingHistoryProps {
  rows: WhitelistTable['Row'][]
  onRowAction?: (address: string) => void
}

export const DesktopBTCWhitelistingHistory = ({ rows, onRowAction }: DesktopBTCWhitelistingHistoryProps) => (
  <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block">
    <table className="w-full min-w-[700px]">
      <thead>
        <WhitelistHeaderRow />
      </thead>
      <tbody>
        {rows.map(row => (
          <WhitelistDataRow key={row.id} row={row} onAction={onRowAction} />
        ))}
      </tbody>
    </table>
  </div>
)
