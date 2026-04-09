import { memo } from 'react'

import { Row } from '@/shared/context'

import { MobileStakingHistoryCard } from './MobileStakingHistoryCard'
import { ColumnId, StakingHistoryCellDataMap } from './StakingHistoryTable.config'

interface MobileStakingHistoryComponentProps {
  rows: Row<ColumnId, Row['id'], StakingHistoryCellDataMap>[]
}

export const MobileStakingHistory = memo(({ rows }: MobileStakingHistoryComponentProps) => {
  return (
    <div className="flex flex-col gap-2 w-full md:hidden" data-testid="MobileStakingHistory">
      {rows.map(row => (
        <MobileStakingHistoryCard key={row.id} row={row} />
      ))}
    </div>
  )
})

MobileStakingHistory.displayName = 'MobileStakingHistory'
