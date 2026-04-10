'use client'

import type { Dispatch } from 'react'

import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { TokenImage } from '@/components/TokenImage/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Sort } from '@/shared/context'
import { useTableActionsContext, useTableContext } from '@/shared/context'

import {
  type AuditLogCellDataMap,
  type AuditLogTableModel,
  type ColumnId,
  type SortableColumnId,
} from '../config'
import type { AuditLogEntry, AuditLogUserRole } from '../types'
import { auditLogValueReasonDetail, formatAuditAmountUsd } from '../utils'

const ROLE_STYLES: Record<AuditLogUserRole, string> = {
  Admin: 'bg-[#08ffd0] text-v3-text-0',
  'Fund Manager': 'bg-v3-rsk-purple text-v3-text-0',
}

const dispatchAuditSort = (
  dispatch: Dispatch<AuditLogTableModel['Action']>,
  columnId: SortableColumnId,
  currentSort: Sort<ColumnId>,
) => {
  if (currentSort.columnId !== columnId) {
    dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId, direction: 'desc' } })
    return
  }
  const nextDir = currentSort.direction === 'desc' ? 'asc' : currentSort.direction === 'asc' ? null : 'desc'
  dispatch({
    type: 'SORT_BY_COLUMN',
    payload: { columnId: nextDir ? columnId : null, direction: nextDir },
  })
}

interface SortableHeaderProps {
  label: string
  columnId: SortableColumnId
  className?: string
}

const SortableHeader = ({ label, columnId, className }: SortableHeaderProps) => {
  const { sort } = useTableContext<ColumnId, AuditLogCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, AuditLogCellDataMap>()
  const isActive = sort.columnId === columnId && sort.direction !== null
  return (
    <th
      className={cn('text-left cursor-pointer select-none', className)}
      onClick={() => dispatchAuditSort(dispatch, columnId, sort)}
    >
      <div className="flex items-center gap-1.5">
        {!isActive && <ArrowsUpDown color="white" size={16} />}
        {isActive && sort.direction === 'desc' && <ArrowDownWFill color="white" size={16} />}
        {isActive && sort.direction === 'asc' && <ArrowUpWFill color="white" size={16} />}
        <Span variant="tag-s" bold>
          {label}
        </Span>
      </div>
    </th>
  )
}

const TokenAmountRow = ({ tokenAmount, usdLabel }: { tokenAmount: string; usdLabel: string | null }) => (
  <div className="flex items-end gap-2">
    <div className="flex flex-col items-end pb-0.5">
      <div className="flex items-center gap-1">
        <Span variant="body">{tokenAmount}</Span>
        <TokenImage symbol={RBTC} size={16} />
      </div>
      {usdLabel ? (
        <Span variant="body-xs" className="text-v3-bg-accent-0">
          {usdLabel}
        </Span>
      ) : null}
    </div>
  </div>
)

const ValueReasonCell = ({ entry }: { entry: AuditLogEntry }) => {
  const prices = useGetSpecificPrices()
  const rbtcUsdPrice = prices[RBTC]?.price ?? 0
  const usdLabel = formatAuditAmountUsd(entry.amountWei, rbtcUsdPrice)

  if (entry.tokenAmount != null) {
    return <TokenAmountRow tokenAmount={entry.tokenAmount} usdLabel={usdLabel} />
  }

  const reasonDetail = auditLogValueReasonDetail(entry)
  if (reasonDetail) {
    return <Span className="truncate block max-w-full">{reasonDetail}</Span>
  }

  return <Span variant="body-l">—</Span>
}

export const DesktopAuditLogHistory = () => {
  const { rows } = useTableContext<ColumnId, AuditLogCellDataMap>()

  return (
    <table className="w-full min-w-[700px]">
      <thead>
        <tr className="border-b border-b-v3-text-60">
          <SortableHeader label="Date" columnId="date" className="w-[110px] pb-4" />
          <SortableHeader label="Action" columnId="action" className="pb-4" />
          <th className="text-left pb-4">
            <Span variant="tag-s" bold>
              Value/Reason
            </Span>
          </th>
          <SortableHeader label="Role" columnId="role" className="w-[150px] pb-4" />
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-b-v3-bg-accent-60 h-16">
            <td className="py-3 pr-4">
              <Span variant="body-s" className="whitespace-nowrap">
                {row.data.date}
              </Span>
            </td>
            <td className="py-3 pr-4">
              <Span className="truncate block max-w-full">{row.data.action}</Span>
            </td>
            <td className="py-3 pr-4">
              <ValueReasonCell entry={row.data.detail} />
            </td>
            <td className="py-3">
              <div className="flex items-center justify-center">
                <Span
                  variant="body-xs"
                  className={cn('px-2 py-1 rounded-full whitespace-nowrap', ROLE_STYLES[row.data.role])}
                >
                  {row.data.role}
                </Span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
