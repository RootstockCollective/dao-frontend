import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { ColumnId, COLUMN_TRANSFORMS, VaultHistoryCellDataMap } from './VaultHistoryTable.config'
import { Paragraph } from '@/components/Typography'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon'
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon'
import { TokenImage } from '@/components/TokenImage'

const TOKEN_SYMBOL = 'USDRIF'

const TableCellBase = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
}: HtmlHTMLAttributes<HTMLTableCellElement> & {
  columnId: ColumnId
  forceShow?: boolean
}): ReactNode => {
  const { columns } = useTableContext<ColumnId, VaultHistoryCellDataMap>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
        onClick={onClick}
        data-testid={`VaultHistoryCell${columnId}`}
      >
        {children}
      </td>
    )
  }
  return null
}

const TableCell = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
}: HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId; forceShow?: boolean }): ReactNode => {
  return (
    <TableCellBase className={className} onClick={onClick} columnId={columnId} forceShow={forceShow}>
      {children}
    </TableCellBase>
  )
}

interface PeriodCellProps {
  period: string
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const PeriodCell: FC<PeriodCellProps> = ({ period, isHovered }): ReactElement => {
  return (
    <TableCell columnId="period">
      <Paragraph variant="body-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {period}
      </Paragraph>
    </TableCell>
  )
}

interface ActionCellProps {
  action: 'DEPOSIT' | 'WITHDRAW'
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const ActionCell: FC<ActionCellProps> = ({ action, isHovered, isDetailRow }): ReactElement => {
  const showContent = !isDetailRow
  const formattedAction = action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()

  return (
    <TableCell columnId="action" className="justify-center gap-2">
      {showContent && (
        <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
          {formattedAction}
        </Paragraph>
      )}
    </TableCell>
  )
}

interface AssetsCellProps {
  assets: string
  action: 'DEPOSIT' | 'WITHDRAW'
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const AssetsCell: FC<AssetsCellProps> = ({
  assets,
  action,
  isHovered,
  isExpanded,
  isDetailRow,
}): ReactElement => {
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
          <TokenImage symbol={'USDRIF'} size={16} />
          <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
            {TOKEN_SYMBOL}
          </Paragraph>
        </>
      )}
    </TableCell>
  )
}

interface TotalUsdCellProps {
  usd: string
  isGrouped?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
  onToggle?: () => void
}

export const TotalUsdCell: FC<TotalUsdCellProps> = ({ usd, isHovered }): ReactElement => {
  return (
    <TableCell columnId="total_usd" className="justify-center">
      <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {usd}
      </Paragraph>
    </TableCell>
  )
}

export const ActionsCell: FC<TotalUsdCellProps> = ({
  isGrouped,
  isExpanded,
  isHovered,
  onToggle,
}): ReactElement => {
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
