import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn, shortAddress, truncate } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { ColumnId, COLUMN_TRANSFORMS, TransactionHistoryCellDataMap } from './TransactionHistoryTable.config'
import { Paragraph, Span } from '@/components/Typography'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon'
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon'
import { TokenImage } from '@/components/TokenImage'
import Link from 'next/link'
import { Builder } from '@/app/collective-rewards/types'
import { Address } from 'viem'

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

export const CycleCell: FC<CycleCellProps> = ({ cycle, isHovered, isDetailRow }): ReactElement => {
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
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const DateCell: FC<DateCellProps> = ({ formatted, isHovered }): ReactElement => {
  return (
    <TableCell columnId="date">
      <Paragraph variant="body-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {formatted}
      </Paragraph>
    </TableCell>
  )
}

interface FromToCellProps {
  builder?: Builder
  builderAddress?: string
  type: 'Claim' | 'Back'
  isGrouped?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const FromToCell: FC<FromToCellProps> = ({
  builder,
  builderAddress,
  isGrouped,
  isExpanded,
  isHovered,
  isDetailRow,
}): ReactElement => {
  // Grouped row - show purple circle and "Multiple Builders"
  if (isGrouped && !isDetailRow) {
    const showContent = !isExpanded

    return (
      <TableCell columnId="from_to" className="gap-3 overflow-hidden">
        {showContent && (
          <>
            <div className="rounded-full bg-v3-rsk-purple min-w-10 size-10" />
            <div className="flex items-center min-w-0 flex-1">
              <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-primary')}>
                Multiple Builders
              </Paragraph>
            </div>
          </>
        )}
      </TableCell>
    )
  }

  const address = builder?.address ?? builderAddress ?? ''
  const shortedAddress = shortAddress(address as Address)

  const builderName = builder?.builderName || ''
  const displayName = builderName ? truncate(builderName, 15) : shortedAddress

  return (
    <TableCell columnId="from_to" className="gap-3 overflow-hidden">
      <Jdenticon className="rounded-full bg-white min-w-10 size-10" value={builderAddress} />
      <div className="flex items-center min-w-0 flex-1">
        <Link
          href={`/proposals/${builder?.proposal.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1"
        >
          <Paragraph
            variant="body"
            className={cn(
              'hover:underline hover:underline-offset-2',
              'truncate overflow-hidden text-ellipsis whitespace-nowrap',
              isHovered ? 'text-black' : 'text-v3-primary',
            )}
          >
            {displayName}
          </Paragraph>
        </Link>
      </div>
    </TableCell>
  )
}

interface TypeCellProps {
  type: 'Claim' | 'Back'
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const TypeCell: FC<TypeCellProps> = ({ type, isHovered, isDetailRow }): ReactElement => {
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
  amounts: Array<{ address: string; value: string; symbol: string }>
  type: 'Claim' | 'Back'
  increased?: boolean
  isExpanded?: boolean
  isHovered?: boolean
  isDetailRow?: boolean
}

export const AmountCell: FC<AmountCellProps> = ({
  amounts,
  type,
  increased,
  isExpanded,
  isHovered,
  isDetailRow,
}): ReactElement => {
  const isBack = type === 'Back'
  const showArrow = isBack && increased !== undefined
  const showContent = !isExpanded || isDetailRow

  return (
    <TableCell columnId="amount" className="flex flex-col items-center justify-center gap-1">
      {showContent &&
        amounts.map(({ value, symbol }, idx) => {
          return (
            <div key={idx} className="flex items-center gap-2">
              {showArrow && (
                <span className="flex items-center">
                  {increased ? (
                    <ArrowUpIcon size={16} color="#1bc47d" />
                  ) : (
                    <ArrowDownIcon size={16} color="#f68" />
                  )}
                </span>
              )}
              <Paragraph
                variant="body"
                className={cn(
                  showArrow
                    ? increased
                      ? 'text-v3-success'
                      : 'text-error'
                    : isHovered
                      ? 'text-black'
                      : 'text-v3-text-100',
                )}
              >
                {value}
              </Paragraph>
              <TokenImage symbol={symbol} size={16} />
              <Span variant="tag-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
                {symbol}
                {idx < amounts.length - 1 ? ' +' : ''}
              </Span>
            </div>
          )
        })}
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

export const TotalAmountCell: FC<TotalAmountCellProps> = ({
  usd,
  isGrouped,
  isExpanded,
  isHovered,
  isDetailRow,
  onToggle,
}): ReactElement => {
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
          <Paragraph variant="body" className="text-v3-text-100">
            {usd}
          </Paragraph>
        ) : null}
      </TableCell>
    )
  }

  // For normal rows and detail rows: always show USD
  return (
    <TableCell columnId="total_amount" className="justify-center">
      <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
        {usd}
      </Paragraph>
    </TableCell>
  )
}
