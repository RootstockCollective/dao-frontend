import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { TOKENS } from '@/lib/tokens'
import { FC } from 'react'
import { Address } from 'viem'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'
import { BackerRewardsTableContainer } from './Table'
import { RewardsContextProvider } from '@/app/shared/context/RewardsContext/RewardsContext'

export const BackerRewards: FC<{ backer: Address }> = ({ backer }) => {
  return (
    <div className="flex flex-col w-full gap-10">
      <BackerRewardsContextProvider backer={backer} tokens={TOKENS}>
        <RewardsContextProvider>
          <BackerRewardsMetrics backer={backer} />
        </RewardsContextProvider>
        <BackerRewardsTableContainer />
      </BackerRewardsContextProvider>
    </div>
  )
}
