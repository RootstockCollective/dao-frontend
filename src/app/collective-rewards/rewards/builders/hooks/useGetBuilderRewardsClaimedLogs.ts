import { useQuery } from '@tanstack/react-query'
import { fetchBuilderRewardsClaimed } from '@/app/collective-rewards/actions'
import { Address, getAddress, parseEventLogs } from 'viem'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export type BuilderRewardsClaimedEventLog = ReturnType<
  typeof parseEventLogs<typeof GaugeAbi, true, 'BuilderRewardsClaimed'>
>

export type BuilderRewardsClaimedPerToken = Record<Address, BuilderRewardsClaimedEventLog>

export const useGetBuilderRewardsClaimedLogs = (gauge: Address) => {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await fetchBuilderRewardsClaimed(gauge)

      const events = parseEventLogs({
        abi: GaugeAbi,
        logs: data,
        eventName: 'BuilderRewardsClaimed',
      })

      return events.reduce<BuilderRewardsClaimedPerToken>((acc, log) => {
        const rewardToken = getAddress(log.args.rewardToken_)
        acc[rewardToken] = [...(acc[rewardToken] || []), log]

        return acc
      }, {})
    },
    queryKey: ['builderRewardsClaimedLogs', gauge],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: {},
  })

  return {
    data,
    error,
    isLoading,
  }
}
