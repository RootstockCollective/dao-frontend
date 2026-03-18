'use client'

import Link from 'next/link'
import type { HtmlHTMLAttributes, ReactNode } from 'react'

import { MoneyIconKoto } from '@/components/Icons'
import { ArrowRight, TrashIcon } from '@/components/Icons/v3design'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { btcVaultRequestDetail } from '@/shared/constants/routes'
import { useTableContext } from '@/shared/context'

import type { RequestStatus } from '../../services/types'
import type { DisplayRequestType, DisplayStatus, DisplayStatusLabel } from '../../services/ui/types'
import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'
import { COLUMN_TRANSFORMS } from './BtcVaultHistoryTable.config'
import { RequestStatusBadge } from './RequestStatusBadge'

interface TableCellProps extends HtmlHTMLAttributes<HTMLTableCellElement> {
  columnId: ColumnId
}

const TableCell = ({ children, className, columnId }: TableCellProps): ReactNode => {
  const { columns } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()
  const column = columns.find(col => col.id === columnId)
  if (column?.hidden) return null

  return (
    <td
      className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
      data-testid={`btc-vault-history-cell-${columnId}`}
    >
      {children}
    </td>
  )
}

interface CellStateProps {
  isHovered?: boolean
}

interface TypeCellProps extends CellStateProps {
  type: DisplayRequestType
}

export const TypeCell = ({ type, isHovered }: TypeCellProps) => (
  <TableCell columnId="type">
    <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
      {type}
    </Paragraph>
  </TableCell>
)

interface DateCellProps extends CellStateProps {
  date: string
}

export const DateCell = ({ date, isHovered }: DateCellProps) => (
  <TableCell columnId="date">
    <Paragraph variant="body-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
      {date}
    </Paragraph>
  </TableCell>
)

interface AmountCellProps extends CellStateProps {
  amount: string
  fiatAmount: string | null
  claimTokenType: 'rbtc' | 'shares'
}

export const AmountCell = ({ amount, fiatAmount, claimTokenType, isHovered }: AmountCellProps) => {
  if (claimTokenType === 'shares') {
    return (
      <TableCell columnId="amount">
        <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
          {amount} shares
        </Paragraph>
      </TableCell>
    )
  }

  return (
    <TableCell columnId="amount">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
            {amount}
          </Paragraph>
          <TokenImage symbol={RBTC} size={16} />
        </div>
        {fiatAmount && (
          <Paragraph variant="body-xs" className={cn(isHovered ? 'text-black/60' : 'text-v3-text-60')}>
            {fiatAmount}
          </Paragraph>
        )}
      </div>
    </TableCell>
  )
}

interface StatusCellProps extends CellStateProps {
  displayStatus: DisplayStatus
  displayStatusLabel: DisplayStatusLabel
}

export const StatusCell = ({ displayStatus, displayStatusLabel }: StatusCellProps) => (
  <TableCell columnId="status">
    <RequestStatusBadge displayStatus={displayStatus} label={displayStatusLabel} />
  </TableCell>
)

interface ActionsCellProps {
  requestId: string
  requestStatus: RequestStatus
  type: DisplayRequestType
  isHovered: boolean
}

const actionLinkClass = 'flex items-center gap-1 font-medium text-black no-underline hover:underline'

/**
 * Claimable: "Claim shares"/"Claim rBTC" links to detail. Pending: "Cancel request" links to detail.
 * Done/failed/cancelled: "View Detail" only, links to detail. Actions visible on hover (desktop).
 */
export const ActionsCell = ({ requestId, requestStatus, type, isHovered }: ActionsCellProps) => {
  if (!isHovered) {
    return <TableCell columnId="actions" />
  }

  const viewDetailLink = (
    <Link href={btcVaultRequestDetail(requestId)} className={actionLinkClass}>
      <Paragraph variant="body-s" className="font-medium text-black">
        View Detail
      </Paragraph>
      <ArrowRight size={16} color="black" />
    </Link>
  )

  if (requestStatus === 'claimable') {
    return (
      <TableCell columnId="actions">
        <Link href={btcVaultRequestDetail(requestId)} className={actionLinkClass}>
          <Paragraph variant="body-s" className="font-medium text-black">
            {type === 'Deposit' ? 'Claim shares' : 'Claim rBTC'}
          </Paragraph>
          <MoneyIconKoto size={16} color="black" />
        </Link>
      </TableCell>
    )
  }

  if (requestStatus === 'pending') {
    return (
      <TableCell columnId="actions">
        <Link href={btcVaultRequestDetail(requestId)} className={actionLinkClass}>
          <Paragraph variant="body-s" className="font-medium text-black">
            Cancel request
          </Paragraph>
          <TrashIcon size={16} color="black" />
        </Link>
      </TableCell>
    )
  }

  if (requestStatus === 'done' || requestStatus === 'failed' || requestStatus === 'cancelled') {
    return <TableCell columnId="actions">{viewDetailLink}</TableCell>
  }

  return <TableCell columnId="actions" />
}
