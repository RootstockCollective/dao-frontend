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
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderOperational } from '@/app/collective-rewards/utils'

type BackerRewardsPercentageContext = {
  update: SetBackerRewardsForBuilder
  current: BackerRewardResponse
  rewardPercentageToApply: RewardPercentageToApply
  isBuilderOperational: boolean
}

const BuilderSettingsContext = createContext<BackerRewardsPercentageContext>(
  {} as BackerRewardsPercentageContext,
)

export const useBuilderSettingsContext = () => useContext(BuilderSettingsContext)

export const BuilderSettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { getBuilderByAddress } = useBuilderContext()
  const { address } = useAccount()
  const current = useGetBackerRewardsForBuilder(address as Address)
  const update = useSetBackerRewardsForBuilder()
  const rewardPercentageToApply = useGetRewardPercentageToApply(address as Address)
  const builder = getBuilderByAddress(address as Address)
  const isOperational = builder ? isBuilderOperational(builder.stateFlags) : false

  const contextValue: BackerRewardsPercentageContext = {
    update,
    current,
    rewardPercentageToApply,
    isBuilderOperational: isOperational,
  }

  return <BuilderSettingsContext.Provider value={contextValue}>{children}</BuilderSettingsContext.Provider>
}
