import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { ColumnId, COLUMN_TRANSFORMS, StakingHistoryCellDataMap } from './StakingHistoryTable.config'
import { Paragraph } from '@/components/Typography'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon'
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon'
import { TokenImage } from '@/components/TokenImage'
import { STRIF } from '@/lib/constants'

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
  const { columns } = useTableContext<ColumnId, StakingHistoryCellDataMap>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
        onClick={onClick}
        data-testid={`StakingHistoryCell${columnId}`}
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
  action: 'STAKE' | 'UNSTAKE'
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

interface AmountCellProps {
  amount: string
  action: 'STAKE' | 'UNSTAKE'
  increased?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const AmountCell: FC<AmountCellProps> = ({
  amount,
  action,
  isHovered,
  isExpanded,
  isDetailRow,
}): ReactElement => {
  const showContent = !isExpanded || isDetailRow
  const increased = action === 'STAKE'
  return (
    <TableCell columnId="amount" className="flex flex-row items-center justify-center gap-1">
      {showContent && (
        <>
          <span className="flex items-center">
            {increased ? <ArrowUpIcon size={16} color="#1bc47d" /> : <ArrowDownIcon size={16} color="#f68" />}
          </span>
          <Paragraph variant="body" className={cn(increased ? 'text-v3-success' : 'text-error')}>
            {amount}
          </Paragraph>
          <TokenImage symbol={'RIF'} size={16} />
          <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
            {STRIF}
          </Paragraph>
        </>
      )}
    </TableCell>
  )
}

interface TotalAmountCellProps {
  usd: string
  isGrouped?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
  onToggle?: () => void
}

export const TotalAmountCell: FC<TotalAmountCellProps> = ({ usd, isHovered }): ReactElement => {
  // For normal rows and detail rows: always show USD
  return (
    <TableCell columnId="total_amount" className="justify-center">
      <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {usd}
      </Paragraph>
    </TableCell>
  )
}

export const ActionsCell: FC<TotalAmountCellProps> = ({
  isGrouped,
  isExpanded,
  isHovered,
  onToggle,
}): ReactElement => {
  // For grouped rows: show USD when not hovered and not expanded
  if (isGrouped) {
    return (
      <TableCell columnId="total_amount" className="justify-center">
        {isHovered ? (
          <button
            onClick={e => {
              e.stopPropagation()
              onToggle?.()
            }}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer w-full h-full self-stretch justify-center"
            data-testid="StakingHistoryToggleDetailsButton"
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

  // For normal rows and detail rows: always show USD
  return (
    <TableCell columnId="total_amount" className="justify-center">
      <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}></Paragraph>
    </TableCell>
  )
}
