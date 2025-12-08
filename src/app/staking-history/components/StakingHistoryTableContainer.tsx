'use client'

import { withTableContext } from '@/shared/context'
import { StakingHistoryCellDataMap, ColumnId } from './StakingHistoryTable.config'
import StakingHistoryTable from '@/app/staking-history/components/StakingHistoryTable'

const StakingHistoryTableContainer = () => {
  return <StakingHistoryTable data-testid="StakingHistoryTable" />
}

export default withTableContext<ColumnId, StakingHistoryCellDataMap>(StakingHistoryTableContainer)
