import { withTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { TransactionHistoryCellDataMap, ColumnId } from './BuilderTransactionHistoryTable.config'
import { BuilderTransactionHistory } from './BuilderTransactionHistory'

const BuilderTransactionHistoryContainer = (): ReactElement => {
  return <BuilderTransactionHistory />
}

export default withTableContext<ColumnId, TransactionHistoryCellDataMap>(BuilderTransactionHistoryContainer)
