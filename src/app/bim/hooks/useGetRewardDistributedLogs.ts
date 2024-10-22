import { useQuery } from '@tanstack/react-query'
import { fetchRewardDistributedLogs } from '@/app/bim/actions'
import { Address, isAddressEqual, parseEventLogs } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { ZeroAddress } from 'ethers'
import { getCoinBaseAddress } from '../utils/getCoinBaseAddress'

export const useGetRewardDistributedLogs = (rewardToken?: Address, builder?: Address) => {
  const resolvedRewardToken = rewardToken === ZeroAddress ? getCoinBaseAddress() : rewardToken

  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchRewardDistributedLogs()

      const events = parseEventLogs({
        abi: SimplifiedRewardDistributorAbi,
        logs: data,
        eventName: 'RewardDistributed',
      })

      let filteredEvents = events
      if (resolvedRewardToken) {
        filteredEvents = filteredEvents.filter(({ args }) =>
          isAddressEqual(args.rewardToken_, resolvedRewardToken),
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
