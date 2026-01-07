import { Row } from '@/shared/context/TableContext/types'
import { ColumnId, TransactionHistoryCellDataMap } from './TransactionHistoryTable.config'
import { TransactionHistoryHeaderRow } from './TransactionHistoryHeaderRow'
import { TransactionHistoryDataRow } from './TransactionHistoryDataRow'
import { Suspense } from 'react'

export const DesktopTransactionHistory = ({
  rows,
}: {
  rows: Row<ColumnId, Row['id'], TransactionHistoryCellDataMap>[]
}) => {
  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80 hidden md:block">
      <table className="w-full min-w-[700px]">
        <thead>
          <TransactionHistoryHeaderRow />
        </thead>
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody>
            {rows.map(row => (
              <TransactionHistoryDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
}
