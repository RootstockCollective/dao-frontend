import { FC, useMemo } from 'react'
import BackerRewardsTableContainer from '../Table/BackerRewardsTableContainer'
import { getTokens } from '@/lib/tokens'
import { useAccount } from 'wagmi'
import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'

export const BackerRewards: FC = () => {
  const { address: userAddress } = useAccount()
  const tokens = useMemo(() => getTokens(), [])

  return (
    <div className="flex flex-col w-full">
      <BackerRewardsContextProvider backer={userAddress!} tokens={tokens}>
        <BackerRewardsTableContainer />
      </BackerRewardsContextProvider>
    </div>
  )
}
