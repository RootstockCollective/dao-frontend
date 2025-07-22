import { FC } from 'react'
import { useAccount } from 'wagmi'
import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'
import { BackerRewardsNotConnected } from './BackerRewardsNotConnected'
import { TOKENS } from '@/lib/tokens'

export const BackerRewards: FC = () => {
  const { address: userAddress, isConnected } = useAccount()

  return (
    <div className="flex flex-col w-full">
      <BackerRewardsContextProvider backer={userAddress!} tokens={TOKENS}>
        {isConnected ? <BackerRewardsMetrics backer={userAddress!} /> : <BackerRewardsNotConnected />}
      </BackerRewardsContextProvider>
    </div>
  )
}
