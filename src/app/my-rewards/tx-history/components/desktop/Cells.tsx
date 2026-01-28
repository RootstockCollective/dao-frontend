import { HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { ColumnId, COLUMN_TRANSFORMS, TransactionHistoryCellDataMap } from '../../config'
import { Paragraph } from '@/components/Typography'
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon'
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon'
import { Builder } from '@/app/collective-rewards/types'
import { EXPLORER_URL } from '@/lib/constants'
import { AmountDisplay, BuilderAvatar, MultipleBuildersAvatar, UsdValue } from '../shared'
import { Address } from 'viem'
import { TransactionHistoryType } from '../../utils/types'
import { TransactionAmount } from '../../config/table.config'

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
  const { columns } = useTableContext<ColumnId, TransactionHistoryCellDataMap>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
        onClick={onClick}
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

interface CycleCellProps {
  cycle: string | null
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const CycleCell = ({ cycle, isHovered, isDetailRow }: CycleCellProps): ReactElement => {
  const showContent = !isDetailRow

  return (
    <TableCell columnId="cycle" className="justify-center">
      {showContent && (
        <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')} bold>
          {cycle || '-'}
        </Paragraph>
      )}
    </TableCell>
  )
}

interface DateCellProps {
  timestamp: string
  formatted: string
  transactionHash: string
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const DateCell = ({ formatted, transactionHash, isHovered }: DateCellProps): ReactElement => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`${EXPLORER_URL}/tx/${transactionHash}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <TableCell columnId="date">
      <Paragraph
        variant="body-s"
        className={cn(
          'hover:underline hover:underline-offset-2 cursor-pointer',
          isHovered ? 'text-black' : 'text-v3-text-100',
        )}
        onClick={handleClick}
      >
        {formatted}
      </Paragraph>
    </TableCell>
  )
}

interface FromToCellProps {
  builder?: Builder
  builderAddress?: Address
  type: TransactionHistoryType
  isGrouped?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const FromToCell = ({
  builder,
  builderAddress,
  isGrouped,
  isExpanded,
  isHovered,
  isDetailRow,
}: FromToCellProps): ReactElement => {
  // Grouped row - show purple circle and "Multiple Builders"
  if (isGrouped && !isDetailRow) {
    const showContent = !isExpanded

    return (
      <TableCell columnId="from_to" className="gap-3 overflow-hidden">
        {showContent && <MultipleBuildersAvatar variant="desktop" isHovered={isHovered} />}
      </TableCell>
    )
  }

  return (
    <TableCell columnId="from_to" className="gap-3 overflow-hidden">
      <BuilderAvatar
        builder={builder}
        builderAddress={builderAddress}
        variant="desktop"
        isHovered={isHovered}
      />
    </TableCell>
  )
}

interface TypeCellProps {
  type: TransactionHistoryType
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const TypeCell = ({ type, isHovered, isDetailRow }: TypeCellProps): ReactElement => {
  const showContent = !isDetailRow

  return (
    <TableCell columnId="type" className="justify-center gap-2">
      {showContent && (
        <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
          {type}
        </Paragraph>
      )}
    </TableCell>
  )
}

interface AmountCellProps {
  amounts: TransactionAmount[]
  type: TransactionHistoryType
  increased?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const AmountCell = ({
  amounts,
  type,
  increased,
  isExpanded,
  isHovered,
  isDetailRow,
}: AmountCellProps): ReactElement => {
  const showContent = !isExpanded || isDetailRow

  return (
    <TableCell columnId="amount" className="flex w-full flex-col items-stretch justify-center gap-2">
      {showContent && (
        <AmountDisplay
          amounts={amounts}
          type={type}
          increased={increased}
          variant="desktop"
          isHovered={isHovered}
        />
      )}
    </TableCell>
  )
}

interface TotalAmountCellProps {
  usd: string | string[]
  isGrouped?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
  onToggle?: () => void
}

export const TotalAmountCell = ({
  usd,
  isGrouped,
  isExpanded,
  isHovered,
  isDetailRow,
  onToggle,
}: TotalAmountCellProps): ReactElement => {
  // For grouped rows: show USD when not hovered and not expanded
  if (isGrouped && !isDetailRow) {
    return (
      <TableCell columnId="total_amount" className="justify-center">
        {isHovered ? (
          <button
            onClick={onToggle}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
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
          <UsdValue usd={usd} variant="desktop" />
        ) : null}
      </TableCell>
    )
  }

  // For normal rows and detail rows: always show USD
  return (
    <TableCell columnId="total_amount" className="justify-center">
      <UsdValue usd={usd} variant="desktop" isHovered={isHovered} />
    </TableCell>
  )
}
