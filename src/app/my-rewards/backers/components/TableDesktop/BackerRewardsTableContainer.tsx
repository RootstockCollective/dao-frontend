import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'
import { withTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { BackerRewardsTable } from './BackerRewardsTable'
import { BackerRewardsCellDataMap, ColumnId } from './BackerRewardsTable.config'

const Title = () => {
  return (
    <>
      <Header variant="h4" className="text-nowrap">
        REWARDS DETAILS
      </Header>
    </>
  )
}

const BackerRewardsTableContainer = (): ReactElement => {
  return (
    <ActionsContainer title={<Title />} className="bg-v3-bg-accent-80 p-0">
      <BackerRewardsTable />
    </ActionsContainer>
  )
}

export default withTableContext<ColumnId, BackerRewardsCellDataMap>(BackerRewardsTableContainer)
