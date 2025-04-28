import { useBuilderContext } from '@/app/collective-rewards/user'
import { COINBASE_ADDRESS } from '@/lib/constants'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'

export const useIsBacker = (address: Address) => {
  const {
    data: backerTotalAllocation,
    isLoading: isBackerTotalAllocationLoading,
    error: backerTotalAllocationError,
  } = useReadBackersManager({
    functionName: 'backerTotalAllocation',
    args: [address],
  })

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
    args: [COINBASE_ADDRESS, address],
  })

  const data = useMemo<boolean>(() => {
    if (backerTotalAllocation && backerTotalAllocation > 0n) return true
    if (!backerRewardPerTokenPaidResults || !backerRewardPerTokenPaidResults.length) return false

    return backerRewardPerTokenPaidResults.some(result => result && result > 0n)
  }, [backerTotalAllocation, backerRewardPerTokenPaidResults])

  const error = useMemo(
    () => buildersError ?? backerRewardPerTokenPaidError ?? backerTotalAllocationError,
    [buildersError, backerRewardPerTokenPaidError, backerTotalAllocationError],
  )

  const isLoading = isBuildersLoading || backerRewardPerTokenPaidLoading || isBackerTotalAllocationLoading

  return {
    data,
    isLoading,
    error,
  }
}
