import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { createZeroAddressError } from '@/shared/errors/zeroAddressError'
import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

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

  const fetchedError =
    isFetched && gauge === zeroAddress
      ? {
          ...createZeroAddressError('Gauge', { builder }),
          shortMessage: `${builder} is not a valid builder`,
        }
      : null

  const error = executionError || receiptError || fetchedError

  const claimBuilderReward = (rewardToken?: Address) => {
    return writeContractAsync({
      abi: GaugeAbi,
      address: gauge as Address,
      functionName: 'claimBuilderReward',
      args: rewardToken ? [rewardToken] : [],
    })
  }

  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title: 'Claiming builder rewards',
  })

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
