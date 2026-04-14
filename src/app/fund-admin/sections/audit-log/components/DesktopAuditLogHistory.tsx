'use client'

import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { TokenImage } from '@/components/TokenImage/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'

import { ROLE_LABELS, ROLE_STYLES } from '../constants'
import type { AuditLogCellDataMap, ColumnId } from '../types'
import { formatAuditAmountUsd } from '../utils'
import { SortableHeader } from './SortableHeader'

const TokenAmountRow = ({ tokenAmount }: { tokenAmount: string }) => {
  const prices = useGetSpecificPrices()
  const rbtcUsdPrice = prices[RBTC]?.price ?? 0
  const usdLabel = formatAuditAmountUsd(tokenAmount, rbtcUsdPrice)
  return (
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
}

export const DesktopAuditLogHistory = () => {
  const { rows } = useTableContext<ColumnId, AuditLogCellDataMap>()
  console.log('🚀 ~ DesktopAuditLogHistory ~ rows:', rows)

  return (
    <table className="w-full min-w-[700px]">
      <thead>
        <tr className="border-b border-b-v3-text-60">
          <SortableHeader label="Date" columnId="date" className="w-[110px] pb-4" />
          <th className="text-left pb-4">
            <Span variant="tag-s" bold>
              Action
            </Span>
          </th>
          <th className="text-left pb-4">
            <Span variant="tag-s" bold>
              Value/Reason
            </Span>
          </th>
          <th className="text-left pb-4">
            <Span variant="tag-s" bold>
              Role
            </Span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ id, data }) => (
          <tr key={id} className="border-b border-b-v3-bg-accent-60 h-16">
            <td className="py-3 pr-4">
              <Span variant="body-s" className="whitespace-nowrap">
                {data.date}
              </Span>
            </td>
            <td className="py-3 pr-4">
              <Span className="truncate block max-w-full">{data.action}</Span>
            </td>
            <td className="py-3 pr-4">
              {data.value !== null ? (
                <TokenAmountRow tokenAmount={data.value} />
              ) : data.reason ? (
                <Span className="truncate block max-w-full">{data.reason}</Span>
              ) : (
                <Span variant="body-l">—</Span>
              )}
            </td>
            <td className="py-3">
              <div className="flex items-center justify-center">
                <Span
                  variant="body-xs"
                  className={cn('px-2 py-1 rounded-full whitespace-nowrap', ROLE_STYLES[data.role])}
                >
                  {ROLE_LABELS[data.role]}
                </Span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
