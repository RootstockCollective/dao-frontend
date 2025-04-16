import { useBuilderContext } from '@/app/collective-rewards/user'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'

const COINBASE_ADDRESS = '0xf7ab6cfaebbadfe8b5494022c4c6db776bd63b6b'

export const useGetBackerRewardPerTokenPaid = (backer: Address, token: Address = COINBASE_ADDRESS) => {
  const { data: builders, isLoading: isBuildersLoading, error: buildersError } = useBuilderContext()

  const gauges = builders.reduce<Address[]>((acc, { gauge }) => {
    if (gauge) {
      acc = [...acc, gauge]
    }
    return acc
  }, [])

  const {
    data: backerRewardPerTokenPaidResults,
    isLoading: backerRewardPerTokenPaidLoading,
    error: backerRewardPerTokenPaidError,
  } = useReadGauges({
    addresses: gauges,
    functionName: 'backerRewardPerTokenPaid',
    args: [token, backer],
  })

  const data = useMemo(
    () => backerRewardPerTokenPaidResults.reduce<bigint>((acc, result) => acc + (result ?? 0n), 0n),
    [backerRewardPerTokenPaidResults],
  )

  const isLoading = isBuildersLoading || backerRewardPerTokenPaidLoading
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
