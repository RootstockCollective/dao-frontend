import { memo, Suspense } from 'react'

import { Paragraph } from '@/components/Typography'
import { useTableContext } from '@/shared/context'

import { DepositHistoryDataRow } from './DepositHistoryDataRow'
import { DepositHistoryHeaderRow } from './DepositHistoryHeaderRow'
import type { ColumnId, DepositHistoryCellDataMap } from './DepositHistoryTable.config'

export const DesktopDepositHistory = memo(() => {
  const { rows, error } = useTableContext<ColumnId, DepositHistoryCellDataMap>()

  if (error) {
    return (
      <div className="w-full bg-v3-bg-accent-80 hidden md:flex grow p-8 items-center justify-center">
        <Paragraph className="text-error" data-testid="deposit-history-error">
          {error}
        </Paragraph>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="w-full bg-v3-bg-accent-80 hidden md:flex grow p-8 items-center justify-center">
        <Paragraph className="text-v3-text-secondary" data-testid="no-deposit-history">
          No deposit history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block grow overflow-y-auto">
      <table className="w-full min-w-[700px]">
        <DepositHistoryHeaderRow />
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody data-testid="deposit-history-table-body">
            {rows.map(row => (
              <DepositHistoryDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
})

DesktopDepositHistory.displayName = 'DesktopDepositHistory'
