import { Row } from '@/shared/context/TableContext/types'
import { BackerRewardsCellDataMap, ColumnId } from './BackerRewardsTable.config'
import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { BackerRewardsHeaderRow } from './BackerRewardsHeaderRow'
import { BackerRewardsDataRow } from './BackerRewardsDataRow'
import { Suspense } from 'react'

export const DesktopRewardsDetails = ({
  rows,
  actions,
}: {
  rows: Row<ColumnId, Row['id'], BackerRewardsCellDataMap>[]
  actions: Action[]
}) => {
  return (
    <div className="hidden md:block">
      <div className="w-full overflow-x-auto bg-v3-bg-accent-80">
        <table className="w-full min-w-[700px]">
          <thead>
            <BackerRewardsHeaderRow actions={actions} />
          </thead>
          <Suspense fallback={<div>Loading table data...</div>}>
            <tbody>
              {rows.map(row => (
                <BackerRewardsDataRow key={row.id} row={row} />
              ))}
            </tbody>
          </Suspense>
        </table>
      </div>
    </div>
  )
}
