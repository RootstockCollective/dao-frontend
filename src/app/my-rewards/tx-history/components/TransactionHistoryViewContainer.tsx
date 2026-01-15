import { withTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { TransactionHistoryCellDataMap, ColumnId } from '../config'
import TransactionHistoryView from './TransactionHistoryView'

const TransactionHistoryViewContainer = (): ReactElement => {
  return <TransactionHistoryView />
}

export default withTableContext<ColumnId, TransactionHistoryCellDataMap>(TransactionHistoryViewContainer)
