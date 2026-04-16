'use client'

import { TokenImage } from '@/components/TokenImage/TokenImage'
import { Paragraph, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'

import { ROLE_LABELS, ROLE_STYLES } from '../constants'
import type { AuditLogCellDataMap, ColumnId } from '../types'
import { SortableHeader } from './SortableHeader'

const TokenAmountRow = ({
  formattedAmount,
  usdAmount,
}: {
  formattedAmount: string
  usdAmount: string | null
}) => {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col items-end pb-0.5">
        <div className="flex items-center gap-1">
          <Span variant="body">{formattedAmount}</Span>
          <TokenImage symbol={RBTC} size={16} />
        </div>
        {usdAmount && (
          <Span variant="body-xs" className="text-v3-bg-accent-0">
            {usdAmount}
          </Span>
        )}
      </div>
    </div>
  )
}

export const DesktopAuditLogHistory = () => {
  const { rows, loading } = useTableContext<ColumnId, AuditLogCellDataMap>()

  return (
    <table className="w-full min-w-[700px] table-fixed">
      <colgroup>
        <col className="w-36" />
        <col className="w-72" />
        <col />
        <col className="w-36" />
      </colgroup>
      <thead>
        <tr className="border-b border-b-v3-text-60">
          <SortableHeader label="Date" columnId="date" className="pb-4 pr-4" />
          <th className="text-left pb-4 pr-4">
            <Span variant="tag-s" bold>
              Action
            </Span>
          </th>
          <th className="text-left pb-4 pr-4">
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
        {loading ? (
          <tr>
            <td colSpan={4} className="py-8">
              <Paragraph variant="body-s" className="text-v3-bg-accent-0 m-0">
                Loading…
              </Paragraph>
            </td>
          </tr>
        ) : (
          rows.map(({ id, data }) => (
            <tr key={id} className="border-b border-b-v3-bg-accent-60 h-16">
              <td className="py-3 pr-4">
                <Span variant="body-s" className="whitespace-nowrap block truncate">
                  {data.date}
                </Span>
              </td>
              <td className="py-3 pr-4">
                <Span className="truncate block max-w-full">{data.action}</Span>
              </td>
              <td className="py-3 pr-4">
                {data.value || data.reason ? (
                  <div className="flex items-center gap-3 min-w-0">
                    {data.value && (
                      <TokenAmountRow
                        formattedAmount={data.value.formattedAmount}
                        usdAmount={data.value.usdAmount}
                      />
                    )}
                    {data.reason && <Span className="truncate">{data.reason}</Span>}
                  </div>
                ) : (
                  <Span variant="body-l">—</Span>
                )}
              </td>
              <td className="py-3">
                {data.role ? (
                  <div className="flex items-center max-w-full">
                    <Span
                      variant="body-xs"
                      className={cn(
                        'px-2 py-1 rounded-full whitespace-nowrap truncate',
                        ROLE_STYLES[data.role],
                      )}
                    >
                      {ROLE_LABELS[data.role]}
                    </Span>
                  </div>
                ) : (
                  <Span variant="body-l">—</Span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
