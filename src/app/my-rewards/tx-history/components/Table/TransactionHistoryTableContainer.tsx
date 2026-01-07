import { withTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { TransactionHistoryCellDataMap, ColumnId } from './TransactionHistoryTable.config'
import TransactionHistoryTable from './TransactionHistoryTable'

const TransactionHistoryTableContainer = (): ReactElement => {
  return <TransactionHistoryTable />
}

export default withTableContext<ColumnId, TransactionHistoryCellDataMap>(TransactionHistoryTableContainer)
