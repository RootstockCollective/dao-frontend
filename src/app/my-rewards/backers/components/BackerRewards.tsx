import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { TOKENS } from '@/lib/tokens'
import { FC } from 'react'
import { Address } from 'viem'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'

export const BackerRewards: FC<{ backer: Address }> = ({ backer }) => {
  return (
    <div className="flex flex-col w-full">
      <BackerRewardsContextProvider backer={backer} tokens={TOKENS}>
        <BackerRewardsMetrics backer={backer} />
      </BackerRewardsContextProvider>
    </div>
  )
}
