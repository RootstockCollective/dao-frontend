import { Address, zeroAddress } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { createZeroAddressError } from '@/shared/errors/zeroAddressError'
import { useMemo } from 'react'
import { useGetBuilderToGauge } from '@/app/collective-rewards/user'

export const useClaimBuilderRewards = (builder: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const {
    data: gauge,
    isPending: isGaugePending,
    error: gaugeError,
    isFetched,
  } = useGetBuilderToGauge(builder)

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const isClaimFunctionReady = useMemo(
    () => !isGaugePending && !gaugeError && !!gauge,
    [isGaugePending, gaugeError, gauge],
  )

  const error = useMemo(() => {
    if (gaugeError) {
      return {
        ...gaugeError,
        shortMessage: `Failed getting gauge for builder ${builder} (${gaugeError.message})`,
      }
    }

    if (executionError) {
      return {
        ...executionError,
        shortMessage: `Failed claim execution (${executionError.message})`,
      }
    }

    if (receiptError) {
      return {
        ...receiptError,
        shortMessage: `Failed to get claim execution receipt (${receiptError.message})`,
      }
    }

    if (isFetched && gauge === zeroAddress) {
      return {
        ...createZeroAddressError('Gauge', { builder }),
        shortMessage: `${builder} is not a valid builder`,
      }
    }
  }, [gauge, gaugeError, builder, executionError, receiptError, isFetched])

  const claimBuilderReward = (rewardToken?: Address) => {
    return writeContractAsync({
      abi: GaugeAbi,
      address: gauge as Address,
      functionName: 'claimBuilderReward',
      args: rewardToken ? [rewardToken] : [],
    })
  }

  return {
    isClaimFunctionReady,
    claimRewards: (rewardToken?: Address) => isClaimFunctionReady && claimBuilderReward(rewardToken),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}
