import { useBackerTotalAllocation } from '@/app/collective-rewards/allocations/hooks'
import { useGetBackerRewardPerTokenPaid } from '@/app/collective-rewards/rewards/hooks'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { Address, zeroAddress } from 'viem'

export const useIsBuilderOrBacker = (address: Address) => {
  /*
   * An address is a builder or a backer if:
   * - a gauge exists for the address (builder)
   * - the backerRewardPerTokenPaid is greater than 0 (backer)
   */
  const {
    data: gauge,
    isLoading: gaugeLoading,
    error: gaugeError,
  } = useReadBuilderRegistry({
    functionName: 'builderToGauge',
    args: [address],
  })
  const { data: isBacker, isLoading: backerLoading, error: backerError } = useIsBacker(address)

  const isLoading = gaugeLoading || backerLoading
  const error = gaugeError ?? backerError

  return {
    data: gauge !== zeroAddress || isBacker,
    isLoading,
    error,
  }
}

export const useIsBacker = (address: Address) => {
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

  const isLoading = isBackerRewardPerTokenPaidLoading || isBackerTotalAllocationLoading
  const error = backerRewardPerTokenPaidError ?? backerTotalAllocationError

  return {
    data: (backerTotalAllocation && backerTotalAllocation > 0n) || backerRewardPerTokenPaid > 0n,
    isLoading,
    error,
  }
}
