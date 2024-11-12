import { Address, zeroAddress } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { createZeroAddressError } from '@/shared/errors/zeroAddressError'
import { useEffect, useMemo } from 'react'
import { useAlertContext } from '@/app/providers'
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

export const useClaimStateReporting = ({
  error,
  isPendingTx,
  isLoadingReceipt,
  isSuccess,
  receipt,
}: Omit<ReturnType<typeof useClaimBuilderRewards>, 'isClaimFunctionReady' | 'claimRewards'>) => {
  const { setMessage } = useAlertContext()

  useEffect(() => {
    if (error) {
      setMessage({
        severity: 'error',
        title: 'Error claiming rewards',
        content: error.message,
      })
      console.error('🐛 claimError:', error)
    }
  }, [error, setMessage])

  useEffect(() => {
    if (isPendingTx) {
      setMessage({
        severity: 'info',
        content: 'Confirm transaction execution in your wallet',
        title: 'Claiming builder rewards',
      })
    }
  }, [isPendingTx, setMessage])

  useEffect(() => {
    if (isLoadingReceipt) {
      setMessage({
        severity: 'info',
        content: 'Waiting for transaction confirmation. See status details in your wallet.',
        title: 'Claiming builder rewards',
      })
    }
  }, [isLoadingReceipt, setMessage])

  useEffect(() => {
    if (isSuccess && receipt) {
      setMessage({
        severity: 'success',
        title: 'Claiming builder rewards',
        content: `Successfully claimed in tx: ${receipt.transactionHash}`,
      })
    }
  }, [isSuccess, receipt, setMessage])
}
