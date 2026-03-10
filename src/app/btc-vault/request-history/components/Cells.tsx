'use client'

import type { HtmlHTMLAttributes, ReactNode } from 'react'

import { MoneyIconKoto } from '@/components/Icons'
import { TrashIcon } from '@/components/Icons/v3design'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
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
  requestStatus: RequestStatus
  type: DisplayRequestType
  isHovered: boolean
}

/**
 * Renders action buttons for actionable rows (claimable/pending).
 * Actions are only visible when the row is hovered or expanded.
 */
export const ActionsCell = ({ requestStatus, type, isHovered }: ActionsCellProps) => {
  if (!isHovered) {
    return <TableCell columnId="actions" />
  }

  const isClaimable = requestStatus === 'claimable'
  const isPending = requestStatus === 'pending'

  if (isClaimable) {
    return (
      <TableCell columnId="actions">
        <div className="flex items-center gap-1">
          <Paragraph variant="body-s" className="font-medium text-black">
            {type === 'Deposit' ? 'Claim shares' : 'Claim rBTC'}
          </Paragraph>
          <MoneyIconKoto size={16} color="black" />
        </div>
      </TableCell>
    )
  }

  if (isPending) {
    return (
      <TableCell columnId="actions">
        <div className="flex items-center gap-1">
          <Paragraph variant="body-s" className="font-medium text-black">
            Cancel request
          </Paragraph>
          <TrashIcon size={16} color="black" />
        </div>
      </TableCell>
    )
  }

  return <TableCell columnId="actions" />
}

interface DetailActionsCellProps {
  actionLabel: string | null
}

/** Renders the action label for a lifecycle sub-row with matching icon, or "-" when none. */
export const DetailActionsCell = ({ actionLabel }: DetailActionsCellProps) => {
  if (!actionLabel) {
    return (
      <TableCell columnId="actions">
        <Paragraph variant="body-s" className="text-black">
          -
        </Paragraph>
      </TableCell>
    )
  }

  const isCancelAction = actionLabel === 'Cancel request'
  const isClaimAction = actionLabel.startsWith('Claim')
  const Icon = isCancelAction ? TrashIcon : isClaimAction ? MoneyIconKoto : null

  return (
    <TableCell columnId="actions">
      <div className="flex items-center gap-1">
        <Paragraph variant="body-s" className="font-medium text-black">
          {actionLabel}
        </Paragraph>
        {Icon && <Icon size={16} color="black" />}
      </div>
    </TableCell>
  )
}
