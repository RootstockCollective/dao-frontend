import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { BackerRewardPercentage, Builder } from '../../types'

type RawBackerRewardPercentage = [bigint, bigint, bigint]

export const useBuildersWithBackerRewardPercentage = (builders: Builder[]) => {
  const backerRewardPercentageCalls = builders.map(({ address }) => ({
    address: BackersManagerAddress,
    abi: BuilderRegistryAbi,
    functionName: 'backerRewardPercentage',
    args: [address],
  }))

  const {
    data: backerRewardPercentageResults,
    isLoading: backerRewardPercentageLoading,
    error: backerRewardPercentageError,
  } = useReadContracts<RawBackerRewardPercentage[]>({
    contracts: backerRewardPercentageCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const data = useMemo(() => {
    const backerRewardPercentages = backerRewardPercentageResults?.map(({ result }) => {
      if (result === undefined) return undefined

      const [previous, next, cooldown] = result as RawBackerRewardPercentage
      return {
        previous,
        next,
        cooldown,
      } as BackerRewardPercentage
    })

    if (!backerRewardPercentages) return undefined

    return backerRewardPercentages?.map((backerRewardPercentage, index) => ({
      ...builders[index],
      backerRewardPercentage: {
        ...backerRewardPercentage,
      },
    }))
  }, [builders, backerRewardPercentageResults])

  return {
    data,
    isLoading: backerRewardPercentageLoading,
    error: backerRewardPercentageError,
  }
}
