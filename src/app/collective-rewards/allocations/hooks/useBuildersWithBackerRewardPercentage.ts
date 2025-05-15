import { BackerRewardsConfig, Builder } from '@/app/collective-rewards/types'
import { useReadBuilderRegistryForMultipleArgs } from '@/shared/hooks/contracts/collective-rewards/useReadBuilderRegistryForMultipleArgs'
import { Modify } from '@/shared/utility'
import { useMemo } from 'react'
import { ReadContractErrorType } from 'viem'
import { UseReadContractReturnType } from 'wagmi'

type UseGetBackerRewardsReturnType = Pick<
  Modify<UseReadContractReturnType, { data: BackerRewardsConfig[] | undefined }>,
  'data' | 'isLoading' | 'error'
>

type UseBuildersWithBackerRewardPercentage = (builders: Builder[]) => UseGetBackerRewardsReturnType

export const useBuildersWithBackerRewardPercentage: UseBuildersWithBackerRewardPercentage = builders => {
  const args = builders.map(({ address }) => [address] as const)

  const {
    data: backerRewardsPercPerBuilder,
    isLoading: backerRewardsLoading,
    error: backerRewardError,
  } = useReadBuilderRegistryForMultipleArgs({
    functionName: 'backerRewardPercentage',
    args,
  })

  const {
    data: activePercPerBuilder,
    isLoading: activePercentagesLoading,
    error: activePercentagesError,
  } = useReadBuilderRegistryForMultipleArgs({
    functionName: 'getRewardPercentageToApply',
    args,
  })

  const data = useMemo(() => {
    return backerRewardsPercPerBuilder.map((backerRewardsPerc, index) => {
      const [previous, next, cooldown] = (backerRewardsPerc ?? [0n, 0n, 0n]) as [bigint, bigint, bigint]

      return {
        previous,
        next,
        cooldown,
        active: activePercPerBuilder[index] as bigint,
      } as BackerRewardsConfig
    })
  }, [backerRewardsPercPerBuilder, activePercPerBuilder])

  return {
    data,
    isLoading: backerRewardsLoading || activePercentagesLoading,
    error: (backerRewardError ?? activePercentagesError) as ReadContractErrorType,
  }
}
