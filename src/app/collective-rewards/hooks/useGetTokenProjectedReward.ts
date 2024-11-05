import { useGetWhitelistedBuildersLength } from '@/app/collective-rewards/hooks/useGetWhitelistedBuildersLength'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Address } from 'viem'

const ENV_DATA_URL = process.env.NEXT_PUBLIC_ENV_DATA_URL ?? ''

export const useGetTokenProjectedReward = (rewardToken: Address) => {
  const {
    data: wlBuildersLength,
    isLoading: wlBuildersLengthLoading,
    error: wlBuildersLengthError,
  } = useGetWhitelistedBuildersLength()

  const {
    data: totalRewardPerCycleFile,
    isLoading: isLoadingtotalRewardPerCycleFile,
    error: totalRewardPerCycleFileError,
  } = useQuery({
    queryFn: async () => {
      const { data } = await axios.get(ENV_DATA_URL)
      return data
    },
    queryKey: ['totalRewardPerCycleFile'],
    refetchInterval: 30_000,
    initialData: {
      [rewardToken]: 0,
    },
  })

  const builderCount = wlBuildersLength ?? 0n

  const totalRewardPerCycle =
    (!!totalRewardPerCycleFile['totalRewardPerCycle'] &&
      BigInt(totalRewardPerCycleFile['totalRewardPerCycle'][rewardToken])) ||
    0n

  if (!totalRewardPerCycle || !builderCount) {
    return {
      data: {
        projectedReward: 0n,
        share: 0n,
      },
      isLoading: false,
      error: totalRewardPerCycleFileError ?? wlBuildersLengthError,
    }
  }

  const projectedReward = totalRewardPerCycle / builderCount
  const share = 100n / builderCount
  const isLoading = isLoadingtotalRewardPerCycleFile || wlBuildersLengthLoading

  return {
    data: {
      projectedReward,
      share,
    },
    isLoading,
    error: totalRewardPerCycleFileError ?? wlBuildersLengthError,
  }
}
