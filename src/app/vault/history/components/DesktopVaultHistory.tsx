import { Row } from '@/shared/context'
import { Suspense, memo } from 'react'
import { VaultHistoryHeaderRow } from '@/app/vault/history/components/VaultHistoryHeaderRow'
import { ColumnId, VaultHistoryCellDataMap } from '@/app/vault/history/components/VaultHistoryTable.config'
import { VaultHistoryDataRow } from '@/app/vault/history/components/VaultHistoryDataRow'
import { Paragraph } from '@/components/Typography'

export const DesktopVaultHistory = memo(
  ({ rows }: { rows: Row<ColumnId, Row['id'], VaultHistoryCellDataMap>[] }) => {
    if (rows.length === 0) {
      return (
        <div className="w-full bg-v3-bg-accent-80 hidden md:flex grow p-8 items-center justify-center">
          <Paragraph className="text-v3-text-secondary" data-testid="NoVaultHistory">
            No vault history found
          </Paragraph>
        </div>
      )
    }

    return (
      <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block grow overflow-y-auto">
        <table className="w-full min-w-[700px]">
          <VaultHistoryHeaderRow />
          <Suspense fallback={<div>Loading table data...</div>}>
            <tbody data-testid="VaultHistoryTableBody">
              {rows.map(row => (
                <VaultHistoryDataRow key={row.id} row={row} />
              ))}
            </tbody>
          </Suspense>
        </table>
      </div>
    )
  },
)

DesktopVaultHistory.displayName = 'DesktopVaultHistory'
