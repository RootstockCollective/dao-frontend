// Re-export the same table configuration from backer transaction history
// Builder transaction history uses the same columns and structure
export {
  PAGE_SIZE,
  SORT_LABELS,
  COLUMN_TRANSFORMS,
  DEFAULT_HEADERS,
} from '@/app/my-rewards/tx-history/config'

export type {
  ColumnId,
  GroupedTransactionDetail,
  TransactionHistoryCellDataMap,
  TransactionHistoryTable,
} from '@/app/my-rewards/tx-history/config'
