import { Suspense } from 'react'

import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { Row } from '@/shared/context/TableContext/types'

import { BackerRewardsDataRow } from './BackerRewardsDataRow'
import { BackerRewardsHeaderRow } from './BackerRewardsHeaderRow'
import { BackerRewardsCellDataMap, ColumnId } from './BackerRewardsTable.config'

export const DesktopRewardsDetails = ({
  rows,
  actions,
}: {
  rows: Row<ColumnId, Row['id'], BackerRewardsCellDataMap>[]
  actions: Action[]
}) => {
  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block">
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
  )
}
