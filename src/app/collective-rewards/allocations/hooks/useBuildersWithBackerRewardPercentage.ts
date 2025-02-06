import { BackerRewardsConfig, Builder } from '@/app/collective-rewards/types'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Modify } from '@/shared/utility'
import { useMemo } from 'react'
import { ContractFunctionReturnType, ReadContractErrorType } from 'viem'
import { UseReadContractReturnType, useReadContracts } from 'wagmi'
import { useEnvironmentsContext } from '@/shared/context/EnvironmentsContext'

type RawBackerRewardPercentage = ContractFunctionReturnType<
  typeof BuilderRegistryAbi,
  'view',
  'backerRewardPercentage'
>
type RawActivePercentage = ContractFunctionReturnType<
  typeof BuilderRegistryAbi,
  'view',
  'getRewardPercentageToApply'
>

type UseGetBackerRewardsReturnType = Pick<
  Modify<UseReadContractReturnType, { data: (BackerRewardsConfig | undefined)[] | undefined }>,
  'data' | 'isLoading' | 'error'
>
type UseGetBackerRewards = (builders: Builder[]) => UseGetBackerRewardsReturnType

export const useGetBackerRewards: UseGetBackerRewards = builders => {
  const { builderRegistryAddress } = useEnvironmentsContext()

  const backerRewardCalls = builders.map(({ address }) => ({
    address: builderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'backerRewardPercentage',
    args: [address],
  }))

  const activePercentageCalls = builders.map(({ address }) => ({
    address: builderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'getRewardPercentageToApply',
    args: [address],
  }))

  const {
    data: backerRewards,
    isLoading: backerRewardsLoading,
    error: backerRewardError,
  } = useReadContracts<RawBackerRewardPercentage[]>({
    contracts: backerRewardCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const {
    data: activePercentages,
    isLoading: activePercentagesLoading,
    error: activePercentagesError,
  } = useReadContracts<RawActivePercentage[]>({
    contracts: activePercentageCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const data = useMemo(() => {
    if (!backerRewards || !activePercentages) return undefined

    return backerRewards.map<BackerRewardsConfig | undefined>(({ status, error, result }, index) => {
      if (status === 'success' && !error && !!result) {
        const [previous, next, cooldown] = result as RawBackerRewardPercentage

        return {
          previous,
          next,
          cooldown,
          active: activePercentages[index]?.result as RawActivePercentage,
        }
      }
    })
  }, [backerRewards, activePercentages])

  return {
    data,
    isLoading: backerRewardsLoading || activePercentagesLoading,
    error: (backerRewardError ?? activePercentagesError) as ReadContractErrorType,
  }
}
