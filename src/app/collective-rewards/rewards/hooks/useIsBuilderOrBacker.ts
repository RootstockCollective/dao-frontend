import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { useGetBackerRewardPerTokenPaid } from '@/app/collective-rewards/rewards/hooks'

export const useIsBuilderOrBacker = (address: Address) => {
  /*
   * An address is a builder or a backer if:
   * - a gauge exists for the address (builder)
   * - the backerRewardPerTokenPaid is greater than 0 (backer)
   */
  const { data: gauge, isLoading: isGaugeLoading, error: gaugeError } = useGetBuilderToGauge(address)

  const {
    data: backerRewardPerTokenPaid,
    isLoading: isBackerRewardPerTokenPaidLoading,
    error: backerRewardPerTokenPaidError,
  } = useGetBackerRewardPerTokenPaid(address)

  const data = useMemo(() => {
    return (gauge && gauge !== zeroAddress) || backerRewardPerTokenPaid > 0n
  }, [gauge, backerRewardPerTokenPaid])

  const isLoading = useMemo(
    () => isGaugeLoading || isBackerRewardPerTokenPaidLoading,
    [isGaugeLoading, isBackerRewardPerTokenPaidLoading],
  )

  const error = useMemo(
    () => gaugeError ?? backerRewardPerTokenPaidError,
    [gaugeError, backerRewardPerTokenPaidError],
  )

  return {
    data,
    isLoading,
    error,
  }
}
