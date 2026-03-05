import { memo } from 'react'

import { Paragraph } from '@/components/Typography'
import { useTableContext } from '@/shared/context'

import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'
import { MobileBtcVaultHistoryCard } from './MobileBtcVaultHistoryCard'

export const MobileBtcVaultHistory = memo(() => {
  const { rows } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="MobileBtcVaultHistory"
      >
        <Paragraph className="text-v3-text-secondary" data-testid="NoBtcVaultHistory">
          No transaction history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full md:hidden" data-testid="MobileBtcVaultHistory">
      {rows.map(row => (
        <MobileBtcVaultHistoryCard key={row.id} row={row} />
      ))}
    </div>
  )
})

MobileBtcVaultHistory.displayName = 'MobileBtcVaultHistory'
