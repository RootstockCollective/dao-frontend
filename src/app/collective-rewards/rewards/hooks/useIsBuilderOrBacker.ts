import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { useGetBackerRewardPerTokenPaid } from '@/app/collective-rewards/rewards/hooks'
import { useBackerTotalAllocation } from '@/app/collective-rewards/allocations/hooks'

export const useIsBuilderOrBacker = (address: Address) => {
  /*
   * An address is a builder or a backer if:
   * - a gauge exists for the address (builder)
   * - the backerRewardPerTokenPaid is greater than 0 (backer)
   */
  const { data: gauge, isLoading: isGaugeLoading, error: gaugeError } = useGetBuilderToGauge(address)

  const {
    data: backerTotalAllocation,
    isLoading: isBackerTotalAllocationLoading,
    error: backerTotalAllocationError,
  } = useBackerTotalAllocation(address)

  const {
    data: backerRewardPerTokenPaid,
    isLoading: isBackerRewardPerTokenPaidLoading,
    error: backerRewardPerTokenPaidError,
  } = useGetBackerRewardPerTokenPaid(address)

  const data = useMemo(() => {
    return (
      (gauge && gauge !== zeroAddress) ||
      (backerTotalAllocation && backerTotalAllocation > 0n) ||
      backerRewardPerTokenPaid > 0n
    )
  }, [gauge, backerRewardPerTokenPaid, backerTotalAllocation])

  const isLoading = useMemo(
    () => isGaugeLoading || isBackerRewardPerTokenPaidLoading || isBackerTotalAllocationLoading,
    [isGaugeLoading, isBackerRewardPerTokenPaidLoading, isBackerTotalAllocationLoading],
  )

  const error = useMemo(
    () => gaugeError ?? backerRewardPerTokenPaidError ?? backerTotalAllocationError,
    [gaugeError, backerRewardPerTokenPaidError, backerTotalAllocationError],
  )

  return {
    data,
    isLoading,
    error,
  }
}
