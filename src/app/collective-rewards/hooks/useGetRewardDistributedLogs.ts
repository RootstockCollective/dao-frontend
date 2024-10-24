import { useQuery } from '@tanstack/react-query'
import { fetchRewardDistributedLogs } from '@/app/collective-rewards/actions'
import { Address, isAddressEqual, parseEventLogs } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { resolveCollectiveRewardToken } from '@/app/collective-rewards/utils/getCoinBaseAddress'

export const useGetRewardDistributedLogs = (rewardToken?: Address, builder?: Address) => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributedLogs()

      const events = parseEventLogs({
        abi: SimplifiedRewardDistributorAbi,
        logs: data,
        eventName: 'RewardDistributed',
      })

      let filteredEvents = events
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
    queryKey: ['rewardDistributedLogs', rewardToken, builder],
    refetchInterval: 30_000,
    initialData: [],
  })

  return {
    data,
    error,
    isLoading,
  }
}
