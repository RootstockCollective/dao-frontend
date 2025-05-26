import { weiToPercentage } from '@/app/collective-rewards/settings'
import {
  SetBackerRewardsForBuilder,
  useSetBackerRewardsForBuilder,
} from '@/app/collective-rewards/settings/builder/hooks'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderOperational } from '@/app/collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { FeatureFlagProvider, useFeatureFlags } from '@/shared/context/FeatureFlagContext'
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
  maxBackerRewardPercentage: Modify<
    UseReadContractReturnType,
    {
      data: bigint
    }
  >
}

const BuilderSettingsContext = createContext<BackerRewardsPercentageContext>(
  {} as BackerRewardsPercentageContext,
)

export const useBuilderSettingsContext = () => useContext(BuilderSettingsContext)

export const BuilderSettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    flags: { limit_kickback },
  } = useFeatureFlags()
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

  const { data: maxBackerRewardPercentage, ...restOfbackerRewardPercentageLimitResponse } =
    useReadBuilderRegistry(
      {
        functionName: 'backerRewardPercentageLimits',
      },
      {
        enabled: limit_kickback,
        placeholderData: WeiPerEther,
      },
    )

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
    maxBackerRewardPercentage: {
      data: BigInt(weiToPercentage(maxBackerRewardPercentage ?? 0n)),
      ...restOfbackerRewardPercentageLimitResponse,
    },
  }

  return (
    <FeatureFlagProvider>
      <BuilderSettingsContext.Provider value={contextValue}>{children}</BuilderSettingsContext.Provider>
    </FeatureFlagProvider>
  )
}
