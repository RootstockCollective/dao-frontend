import { RewardPercentageToApply, useGetRewardPercentageToApply } from '@/app/collective-rewards/rewards'
import {
  BackerRewardResponse,
  SetBackerRewardsForBuilder,
  useGetBackerRewardsForBuilder,
  useSetBackerRewardsForBuilder,
} from '@/app/collective-rewards/settings/builder/hooks'
import { createContext, FC, ReactNode, useContext } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

type BackerRewardsPercentageContext = {
  update: SetBackerRewardsForBuilder
  current: BackerRewardResponse
  rewardPercentageToApply: RewardPercentageToApply
}

const BuilderSettingsContext = createContext<BackerRewardsPercentageContext>(
  {} as BackerRewardsPercentageContext,
)

export const useBuilderSettingsContext = () => useContext(BuilderSettingsContext)

export const BuilderSettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAccount()
  const current = useGetBackerRewardsForBuilder(address as Address)
  const update = useSetBackerRewardsForBuilder()
  const rewardPercentageToApply = useGetRewardPercentageToApply(address as Address)

  const contextValue: BackerRewardsPercentageContext = {
    update,
    current,
    rewardPercentageToApply,
  }

  return <BuilderSettingsContext.Provider value={contextValue}>{children}</BuilderSettingsContext.Provider>
}
