import { Row } from '@/shared/context/TableContext/types'
import { ColumnId, TransactionHistoryCellDataMap } from '../../config'
import { DesktopHeaderRow } from './DesktopHeaderRow'
import { DesktopDataRow } from './DesktopDataRow'
import { Suspense } from 'react'

export const DesktopTable = ({
  rows,
}: {
  rows: Row<ColumnId, Row['id'], TransactionHistoryCellDataMap>[]
}) => {
  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block">
      <table className="w-full min-w-[700px]">
        <thead>
          <DesktopHeaderRow />
        </thead>
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody>
            {rows.map(row => (
              <DesktopDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
}
