import {
  SetBackerRewardsForBuilder,
  useSetBackerRewardsForBuilder,
} from '@/app/collective-rewards/settings/builder/hooks'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderOperational } from '@/app/collective-rewards/utils'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { Modify } from '@/shared/utility'
import { DateTime } from 'luxon'
import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { useAccount, UseReadContractReturnType } from 'wagmi'

type BackerReward = {
  previous: bigint
  next: bigint
  cooldownEndTime: DateTime
}

export type BackerRewardsPercentageContext = {
  update: SetBackerRewardsForBuilder
  current: Modify<UseReadContractReturnType, { data: BackerReward }>
  rewardPercentageToApply: Modify<UseReadContractReturnType, { data: bigint | undefined }>
  isBuilderOperational: boolean
}

const BuilderSettingsContext = createContext<BackerRewardsPercentageContext>(
  {} as BackerRewardsPercentageContext,
)

export const useBuilderSettingsContext = () => useContext(BuilderSettingsContext)

export const BuilderSettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { getBuilderByAddress } = useBuilderContext()
  const { address } = useAccount()
  const { data: rawCurrentRewardData, ...restCurrentResponse } = useReadBuilderRegistry({
    functionName: 'backerRewardPercentage',
    args: [address ?? zeroAddress],
  })
  const update = useSetBackerRewardsForBuilder()
  const rewardPercentageToApply = useReadBuilderRegistry({
    functionName: 'getRewardPercentageToApply',
    args: [address ?? zeroAddress],
  })

  const builder = getBuilderByAddress(address as Address)
  const isOperational = builder ? isBuilderOperational(builder.stateFlags) : false

  const currentRewardData = useMemo(() => {
    const [previous, next, cooldownEndTime] = rawCurrentRewardData ?? [0n, 0n, 0n]
    return {
      previous,
      next,
      cooldownEndTime: DateTime.fromSeconds(Number(cooldownEndTime)),
    } as BackerReward
  }, [rawCurrentRewardData])

  const contextValue: BackerRewardsPercentageContext = {
    update,
    current: {
      ...restCurrentResponse,
      data: currentRewardData,
    },
    rewardPercentageToApply,
    isBuilderOperational: isOperational,
  }

  return <BuilderSettingsContext.Provider value={contextValue}>{children}</BuilderSettingsContext.Provider>
}
