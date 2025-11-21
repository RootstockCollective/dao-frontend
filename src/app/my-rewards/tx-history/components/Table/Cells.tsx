import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn, truncate } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import {
  ColumnId,
  COLUMN_TRANSFORMS,
  GroupedTransactionDetail,
  TransactionHistoryCellDataMap,
} from './TransactionHistoryTable.config'
import { Paragraph } from '@/components/Typography'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { TokenImage } from '@/components/TokenImage'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import Link from 'next/link'

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
}

export const CycleCell: FC<CycleCellProps> = ({ cycle }): ReactElement => {
  return (
    <TableCell columnId="cycle" className="justify-center">
      <Paragraph variant="body" className="text-v3-text-100" bold>
        {cycle || '-'}
      </Paragraph>
    </TableCell>
  )
}

interface DateCellProps {
  timestamp: string
  formatted: string
}

export const DateCell: FC<DateCellProps> = ({ formatted }): ReactElement => {
  return (
    <TableCell columnId="date">
      <Paragraph variant="body-s" className="text-v3-text-100">
        {formatted}
      </Paragraph>
    </TableCell>
  )
}

interface FromToCellProps {
  builderAddress?: string
  type: 'Claim' | 'Back'
  isGrouped?: boolean
  groupedDetails?: GroupedTransactionDetail[]
}

export const FromToCell: FC<FromToCellProps> = ({
  builderAddress,
  isGrouped,
  groupedDetails,
}): ReactElement => {
  const { builders } = useBuilderContext()

  // Grouped row - show purple circle and "Multiple Builders"
  if (isGrouped) {
    return (
      <TableCell columnId="from_to" className="gap-3 overflow-hidden">
        <div className="rounded-full bg-v3-rsk-purple min-w-10 size-10" />
        <div className="flex items-center min-w-0 flex-1">
          <Paragraph variant="body" className="text-v3-primary">
            Multiple Builders
          </Paragraph>
        </div>
      </TableCell>
    )
  }

  // Single builder row - show Jdenticon and builder name
  const builder = builders.find(b => b.address.toLowerCase() === builderAddress?.toLowerCase())

  const name = builder?.builderName || builderAddress || ''
  const displayName = truncate(name, 18)

  return (
    <TableCell columnId="from_to" className="gap-3 overflow-hidden">
      <Jdenticon className="rounded-full bg-white min-w-10 size-10" value={builderAddress || ''} />
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
              'text-v3-primary hover:underline hover:underline-offset-2',
              'truncate overflow-hidden text-ellipsis whitespace-nowrap',
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
}

export const TypeCell: FC<TypeCellProps> = ({ type }): ReactElement => {
  return (
    <TableCell columnId="type" className="justify-center gap-2">
      <Paragraph variant="body" className="text-v3-text-100">
        {type}
      </Paragraph>
    </TableCell>
  )
}

interface AmountCellProps {
  amounts: Array<{ address: string; value: string; symbol: string }>
  type: 'Claim' | 'Back'
  increased?: boolean
}

export const AmountCell: FC<AmountCellProps> = ({ amounts, type, increased }): ReactElement => {
  const isBack = type === 'Back'
  const showArrow = isBack && increased !== undefined

  return (
    <TableCell columnId="amount" className="flex flex-col items-center justify-center gap-1">
      {amounts.map(({ value, symbol }, idx) => {
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
              className={cn(showArrow ? (increased ? 'text-v3-success' : 'text-error') : 'text-v3-text-100')}
            >
              {value}
            </Paragraph>
            <TokenImage symbol={symbol} size={16} />
            <Paragraph variant="body" className="text-v3-text-100">
              {symbol}
              {idx < amounts.length - 1 ? ' +' : ''}
            </Paragraph>
          </div>
        )
      })}
    </TableCell>
  )
}

interface TotalAmountCellProps {
  usd: string
}

export const TotalAmountCell: FC<TotalAmountCellProps> = ({ usd }): ReactElement => {
  return (
    <TableCell columnId="total_amount" className="justify-center">
      <Paragraph variant="body" className="text-v3-text-100">
        {usd}
      </Paragraph>
    </TableCell>
  )
}
