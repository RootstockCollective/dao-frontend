import { Row } from '@/shared/context'
import { Suspense, memo } from 'react'
import { StakingHistoryHeaderRow } from '@/app/staking-history/components/StakingHistoryHeaderRow'
import {
  ColumnId,
  StakingHistoryCellDataMap,
} from '@/app/staking-history/components/StakingHistoryTable.config'
import { StakingHistoryDataRow } from '@/app/staking-history/components/StakingHistoryDataRow'

export const DesktopStakingHistory = memo(
  ({ rows }: { rows: Row<ColumnId, Row['id'], StakingHistoryCellDataMap>[] }) => {
    return (
      <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block">
        <table className="w-full min-w-[700px]">
          <thead>
            <StakingHistoryHeaderRow />
          </thead>
          <Suspense fallback={<div>Loading table data...</div>}>
            <tbody>
              {rows.map(row => (
                <StakingHistoryDataRow key={row.id} row={row} />
              ))}
            </tbody>
          </Suspense>
        </table>
      </div>
    )
  },
)

DesktopStakingHistory.displayName = 'DesktopStakingHistory'
