import { withTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { StakingHistoryCellDataMap, ColumnId } from './StakingHistoryTable.config'
import StakingHistoryTable from '@/app/staking/components/StakingHistoryTable'

const StakingHistoryTableContainer = (): ReactElement => {
  return <StakingHistoryTable />
}

export default withTableContext<ColumnId, StakingHistoryCellDataMap>(StakingHistoryTableContainer)
