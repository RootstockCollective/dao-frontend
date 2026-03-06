import { memo } from 'react'

import { Paragraph } from '@/components/Typography'
import { useTableContext } from '@/shared/context'

import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'
import { MobileBtcVaultHistoryCard } from './MobileBtcVaultHistoryCard'

export const MobileBtcVaultHistory = memo(() => {
  const { rows, error } = useTableContext<ColumnId, BtcVaultHistoryCellDataMap>()

  if (error) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="mobile-btc-vault-history-error"
      >
        <Paragraph className="text-error" data-testid="btc-vault-history-error">
          {error}
        </Paragraph>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="mobile-btc-vault-history-empty"
      >
        <Paragraph className="text-v3-text-secondary" data-testid="no-btc-vault-history">
          No transaction history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full md:hidden" data-testid="mobile-btc-vault-history">
      {rows.map(row => (
        <MobileBtcVaultHistoryCard key={row.id} row={row} />
      ))}
    </div>
  )
})

MobileBtcVaultHistory.displayName = 'MobileBtcVaultHistory'
