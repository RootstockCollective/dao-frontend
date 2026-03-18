import { memo } from 'react'

import { Paragraph } from '@/components/Typography'
import { useTableContext } from '@/shared/context'

import type { ColumnId, DepositHistoryCellDataMap } from './DepositHistoryTable.config'
import { MobileDepositHistoryCard } from './MobileDepositHistoryCard'

export const MobileDepositHistory = memo(() => {
  const { rows, error } = useTableContext<ColumnId, DepositHistoryCellDataMap>()

  if (error) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="mobile-deposit-history-error"
      >
        <Paragraph className="text-error" data-testid="deposit-history-error">
          {error}
        </Paragraph>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="mobile-deposit-history-empty"
      >
        <Paragraph className="text-v3-text-secondary" data-testid="no-deposit-history">
          No deposit history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full md:hidden" data-testid="mobile-deposit-history">
      {rows.map(row => (
        <MobileDepositHistoryCard key={row.id} row={row} />
      ))}
    </div>
  )
})

MobileDepositHistory.displayName = 'MobileDepositHistory'
