import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { TOKENS } from '@/lib/tokens'
import { FC } from 'react'
import { Address } from 'viem'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'
import { BackerRewardsTableContainer } from './Table'

export const BackerRewards: FC<{ backer: Address }> = ({ backer }) => {
  return (
    <div className="flex flex-col w-full gap-10">
      <BackerRewardsContextProvider backer={backer} tokens={TOKENS}>
        <BackerRewardsMetrics backer={backer} />
        {/* FIXME: Temporary hiding of the table on mobile */}
        <div className="hidden md:block">
          <BackerRewardsTableContainer />
        </div>
      </BackerRewardsContextProvider>
    </div>
  )
}
