import { memo, Suspense } from 'react'

import { Paragraph } from '@/components/Typography'
import { useTableContext } from '@/shared/context'

import { BtcVaultHistoryDataRow } from './BtcVaultHistoryDataRow'
import { BtcVaultHistoryHeaderRow } from './BtcVaultHistoryHeaderRow'
import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'

export const DesktopBtcVaultHistory = memo(() => {
  const { rows, error } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()

  if (error) {
    return (
      <div className="w-full bg-v3-bg-accent-80 hidden md:flex grow p-8 items-center justify-center">
        <Paragraph className="text-error" data-testid="btc-vault-history-error">
          {error}
        </Paragraph>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="w-full bg-v3-bg-accent-80 hidden md:flex grow p-8 items-center justify-center">
        <Paragraph className="text-v3-text-secondary" data-testid="no-btc-vault-history">
          No transaction history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block grow overflow-y-auto">
      <table className="w-full min-w-[700px]">
        <BtcVaultHistoryHeaderRow />
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody data-testid="btc-vault-history-table-body">
            {rows.map(row => (
              <BtcVaultHistoryDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
})

DesktopBtcVaultHistory.displayName = 'DesktopBtcVaultHistory'
