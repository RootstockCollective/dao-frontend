import { useBuilderContext } from '@/app/collective-rewards/user'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetBackerRewardPerTokenPaid = (backer: Address) => {
  const { data: builders, isLoading: isBuildersLoading, error: buildersError } = useBuilderContext()

  const backerRewardPerTokenPaidCalls = builders.map(
    ({ gauge }) =>
      ({
        address: gauge,
        abi: GaugeAbi,
        functionName: 'backerRewardPerTokenPaid',
        args: [backer],
      }) as const,
  )

  const {
    data: backerRewardPerTokenPaidResults,
    isLoading: backerRewardPerTokenPaidLoading,
    error: backerRewardPerTokenPaidError,
  } = useReadContracts<bigint[]>({
    contracts: backerRewardPerTokenPaidCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const data = useMemo(
    () =>
      (backerRewardPerTokenPaidResults ?? []).reduce(
        (acc, { result }) => acc + ((result as bigint) ?? 0n),
        0n,
      ),
    [backerRewardPerTokenPaidResults],
  )

  const isLoading = useMemo(
    () => isBuildersLoading || backerRewardPerTokenPaidLoading,
    [isBuildersLoading, backerRewardPerTokenPaidLoading],
  )
  const error = useMemo(
    () => buildersError ?? backerRewardPerTokenPaidError,
    [buildersError, backerRewardPerTokenPaidError],
  )

  return {
    data,
    isLoading,
    error,
  }
}
