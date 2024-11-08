import { useQuery } from '@tanstack/react-query'
import { fetchRewardDistributedCached } from '@/app/collective-rewards/actions'
import { Address, isAddressEqual, parseEventLogs } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { resolveCollectiveRewardToken } from '@/app/collective-rewards/utils/getCoinBaseAddress'

export const useGetRewardDistributedLogs = (rewardToken?: Address, builder?: Address) => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributedCached()

      return parseEventLogs({
        abi: SimplifiedRewardDistributorAbi,
        logs: data,
        eventName: 'RewardDistributed',
      })
    },
    queryKey: ['rewardDistributedLogs'],
    select: data => {
      let filteredEvents = data
      if (rewardToken) {
        filteredEvents = filteredEvents.filter(({ args }) =>
          isAddressEqual(args.rewardToken_, resolveCollectiveRewardToken(rewardToken)),
        )
      }
      if (builder) {
        filteredEvents = filteredEvents.filter(({ args }) => isAddressEqual(args.builder_, builder))
      }

      return filteredEvents
    },
    refetchInterval: 30_000,
    initialData: [],
  })

  return {
    data,
    error,
    isLoading,
  }
}
