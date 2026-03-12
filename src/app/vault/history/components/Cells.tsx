import { HtmlHTMLAttributes, ReactNode } from 'react'

import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon'
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { USDRIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'

import {
  COLUMN_CONTENT_ALIGN,
  COLUMN_TRANSFORMS,
  ColumnId,
  formatActionLabel,
  TOKEN_SYMBOL,
  VaultHistoryCellDataMap,
} from './VaultHistoryTable.config'

/** Base props for TableCell component */
interface TableCellProps extends HtmlHTMLAttributes<HTMLTableCellElement> {
  columnId: ColumnId
  forceShow?: boolean
}

/** Common state props shared by all cell components */
interface CellStateProps {
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

const TableCell = ({ children, className, onClick, columnId, forceShow }: TableCellProps): ReactNode => {
  const { columns } = useTableContext<ColumnId, VaultHistoryCellDataMap>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn(
          'flex self-stretch items-center select-none',
          COLUMN_TRANSFORMS[columnId],
          COLUMN_CONTENT_ALIGN[columnId],
          className,
        )}
        onClick={onClick}
        data-testid={`VaultHistoryCell${columnId}`}
      >
        {children}
      </td>
    )
  }
  return null
}

interface PeriodCellProps extends CellStateProps {
  period: string
}

export const PeriodCell = ({ period, isHovered }: PeriodCellProps) => {
  return (
    <TableCell columnId="period">
      <Paragraph variant="body-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {period}
      </Paragraph>
    </TableCell>
  )
}

interface ActionCellProps extends CellStateProps {
  action: 'DEPOSIT' | 'WITHDRAW'
}

export const ActionCell = ({ action, isHovered, isDetailRow }: ActionCellProps) => {
  const showContent = !isDetailRow

  return (
    <TableCell columnId="action" className="gap-2">
      {showContent && (
        <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
          {formatActionLabel(action)}
        </Paragraph>
      )}
    </TableCell>
  )
}

interface AssetsCellProps extends CellStateProps {
  assets: string
  action: 'DEPOSIT' | 'WITHDRAW'
}

export const AssetsCell = ({ assets, action, isHovered, isExpanded, isDetailRow }: AssetsCellProps) => {
  const showContent = !isExpanded || isDetailRow
  const increased = action === 'DEPOSIT'
  return (
    <TableCell columnId="assets" className="flex flex-row items-center justify-center gap-1">
      {showContent && (
        <>
          <span className="flex items-center">
            {increased ? <ArrowUpIcon size={16} color="#1bc47d" /> : <ArrowDownIcon size={16} color="#f68" />}
          </span>
          <Paragraph variant="body" className={cn(increased ? 'text-v3-success' : 'text-error')}>
            {assets}
          </Paragraph>
          <TokenImage symbol={USDRIF} size={16} />
          <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
            {TOKEN_SYMBOL}
          </Paragraph>
        </>
      )}
    </TableCell>
  )
}

interface TotalUsdCellProps extends CellStateProps {
  usd: string
}

interface ActionsCellProps extends CellStateProps {
  isGrouped?: boolean
  onToggle?: () => void
}

export const TotalUsdCell = ({ usd, isHovered }: TotalUsdCellProps) => {
  return (
    <TableCell columnId="total_usd">
      <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {usd}
      </Paragraph>
    </TableCell>
  )
}

export const ActionsCell = ({ isGrouped, isExpanded, isHovered, onToggle }: ActionsCellProps) => {
  if (isGrouped) {
    return (
      <TableCell columnId="actions" className="justify-center">
        {isHovered ? (
          <button
            onClick={e => {
              e.stopPropagation()
              onToggle?.()
            }}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer w-full h-full self-stretch justify-center"
            data-testid="VaultHistoryToggleDetailsButton"
          >
            <Paragraph variant="body-s" className="text-black font-medium">
              {isExpanded ? 'Hide details' : 'Show details'}
            </Paragraph>
            {isExpanded ? (
              <ChevronUpIcon size={12} color="black" />
            ) : (
              <ChevronDownIcon size={12} color="black" />
            )}
          </button>
        ) : !isExpanded ? (
          <Paragraph variant="body" className="text-v3-text-100"></Paragraph>
        ) : null}
      </TableCell>
    )
  }

  return (
    <TableCell columnId="actions" className="justify-center">
      <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}></Paragraph>
    </TableCell>
  )
}
