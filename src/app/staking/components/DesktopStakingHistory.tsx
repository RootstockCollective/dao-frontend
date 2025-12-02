import { Row } from '@/shared/context'
import { Suspense } from 'react'
import { StakingHistoryHeaderRow } from '@/app/staking/components/StakingHistoryHeaderRow'
import { ColumnId, StakingHistoryCellDataMap } from '@/app/staking/components/StakingHistoryTable.config'
import { StakingHistoryDataRow } from '@/app/staking/components/StakingHistoryDataRow'

export const DesktopStakingHistory = ({
  rows,
}: {
  rows: Row<ColumnId, Row['id'], StakingHistoryCellDataMap>[]
}) => {
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
}
