import { withTableContext } from '@/shared/context'
import { ColumnId, TransactionHistoryCellDataMap } from '../../config'
import { TransactionHistoryTable } from './TransactionHistoryTable'

export const TransactionHistoryTableContainer = () => {
  return <TransactionHistoryTable />
}

export default withTableContext<ColumnId, TransactionHistoryCellDataMap>(TransactionHistoryTableContainer)
