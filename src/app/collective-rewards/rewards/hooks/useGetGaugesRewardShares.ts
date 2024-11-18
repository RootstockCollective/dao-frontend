import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetGaugesRewardShares = (gauges: Address[]) => {
  const rewardSharesCalls = useMemo(
    () =>
      gauges?.map(
        gauge =>
          ({
            address: gauge,
            abi: GaugeAbi,
            functionName: 'rewardShares',
            args: [],
          }) as const,
      ),
    [gauges],
  )
  const {
    data: rewardSharesResult,
    isLoading,
    error,
  } = useReadContracts<Address[]>({
    contracts: rewardSharesCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
  const rewardShares = useMemo(
    () => rewardSharesResult?.map(share => share.result as bigint),
    [rewardSharesResult],
  )

  return {
    data: rewardShares,
    isLoading,
    error,
  }
}
