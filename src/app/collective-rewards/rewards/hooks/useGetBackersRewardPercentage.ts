import { useReadBuilderRegistryForMultipleArgs } from '@/shared/hooks/contracts/collective-rewards/useReadBuilderRegistryForMultipleArgs'
import { useMemo } from 'react'
import { Address } from 'viem'
import { BackerRewardPercentage } from '../types'
import { getBackerRewardPercentage } from '../utils'

export const useGetBackersRewardPercentage = (builders: Address[], timestampInSeconds?: number) => {
  const {
    data: contractResults,
    isLoading,
    error,
  } = useReadBuilderRegistryForMultipleArgs({
    functionName: 'backerRewardPercentage',
    args: builders?.map(builder => [builder] as const) ?? [],
  })

  const buildersMap = useMemo(() => {
    if (!contractResults || !contractResults.length) {
      return {}
    }
    return builders.reduce<Record<Address, BackerRewardPercentage>>((acc, gauge, index) => {
      const [previous, next, cooldownEndTime] = (contractResults[index] || [0n, 0n, 0n]) as [
        bigint,
        bigint,
        bigint,
      ]
      const backerRewardPercentage = getBackerRewardPercentage(
        previous,
        next,
        cooldownEndTime,
        timestampInSeconds,
      )

      acc[gauge] = backerRewardPercentage

      return acc
    }, {})
  }, [builders, contractResults, timestampInSeconds])

  return {
    data: buildersMap,
    isLoading,
    error,
  }
}
