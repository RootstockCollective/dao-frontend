import { Row } from '@/shared/context'
import { memo } from 'react'
import { ColumnId, VaultHistoryCellDataMap } from './VaultHistoryTable.config'
import { MobileVaultHistoryCard } from './MobileVaultHistoryCard'
import { Paragraph } from '@/components/Typography'

interface MobileVaultHistoryComponentProps {
  rows: Row<ColumnId, Row['id'], VaultHistoryCellDataMap>[]
}

export const MobileVaultHistory = memo(({ rows }: MobileVaultHistoryComponentProps) => {
  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="MobileVaultHistory"
      >
        <Paragraph className="text-v3-text-secondary" data-testid="NoVaultHistory">
          No vault history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full md:hidden" data-testid="MobileVaultHistory">
      {rows.map(row => (
        <MobileVaultHistoryCard key={row.id} row={row} />
      ))}
    </div>
  )
})

MobileVaultHistory.displayName = 'MobileVaultHistory'
