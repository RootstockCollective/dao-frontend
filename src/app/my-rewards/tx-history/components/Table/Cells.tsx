import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn, shortAddress } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { ColumnId, COLUMN_TRANSFORMS, TransactionHistoryCellDataMap } from './TransactionHistoryTable.config'
import { Paragraph } from '@/components/Typography'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { TokenImage } from '@/components/TokenImage'
import { getTokenByAddress } from '@/lib/tokens'

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
      <Paragraph variant="body" className="text-v3-text-100 font-medium">
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
      <Paragraph variant="body" className="text-v3-text-100">
        {formatted}
      </Paragraph>
    </TableCell>
  )
}

interface FromToCellProps {
  builderAddress: string
  type: 'Claim' | 'Back'
}

export const FromToCell: FC<FromToCellProps> = ({ builderAddress }): ReactElement => {
  const displayName = shortAddress(builderAddress as any)

  return (
    <TableCell columnId="from_to" className="gap-3">
      <Jdenticon className="rounded-full bg-white w-10" value={builderAddress} />
      <Paragraph variant="body" className="text-v3-primary font-medium">
        {displayName}
      </Paragraph>
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
  amounts: Array<{ address: string; value: string }>
  type: 'Claim' | 'Back'
  increased?: boolean
}

export const AmountCell: FC<AmountCellProps> = ({ amounts, type, increased }): ReactElement => {
  const isBack = type === 'Back'
  const showArrow = isBack && increased !== undefined

  return (
    <TableCell columnId="amount" className="flex items-center gap-1">
      {amounts.map((amount, idx) => {
        const token = getTokenByAddress(amount.address)
        const symbol = token?.symbol || '???'

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
              {amount.value}
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
