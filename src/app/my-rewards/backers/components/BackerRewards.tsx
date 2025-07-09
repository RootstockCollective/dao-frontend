import { FC, useMemo } from 'react'
import { getTokens } from '@/lib/tokens'
import { useAccount } from 'wagmi'
import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'
import { BackerRewardsNotConnected } from './BackerRewardsNotConnected'

export const BackerRewards: FC = () => {
  const { address: userAddress, isConnected } = useAccount()
  const tokens = useMemo(() => getTokens(), [])

  return (
    <div className="flex flex-col w-full">
      <BackerRewardsContextProvider backer={userAddress!} tokens={tokens}>
        {isConnected ? <BackerRewardsMetrics backer={userAddress!} /> : <BackerRewardsNotConnected />}
      </BackerRewardsContextProvider>
    </div>
  )
}
