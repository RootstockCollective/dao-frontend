import { ReactElement } from 'react'

import { withTableContext } from '@/shared/context'

import { ColumnId, TransactionHistoryCellDataMap } from '../../config'
import { BuilderTransactionHistory } from './BuilderTransactionHistory'

const BuilderTransactionHistoryContainer = (): ReactElement => {
  return <BuilderTransactionHistory />
}

export default withTableContext<ColumnId, TransactionHistoryCellDataMap>(BuilderTransactionHistoryContainer)
