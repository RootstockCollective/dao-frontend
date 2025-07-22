import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { TOKENS } from '@/lib/tokens'
import { FC } from 'react'
import { useAccount } from 'wagmi'
import BackerRewardsTableContainer from '../Table/BackerRewardsTableContainer'

export const BackerRewards: FC = () => {
  const { address: userAddress } = useAccount()

  return (
    <div className="flex flex-col w-full">
      <BackerRewardsContextProvider backer={userAddress!} tokens={TOKENS}>
        <BackerRewardsTableContainer />
      </BackerRewardsContextProvider>
    </div>
  )
}
