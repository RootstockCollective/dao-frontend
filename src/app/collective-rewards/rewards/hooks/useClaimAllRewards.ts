import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address, zeroAddress } from 'viem'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { createZeroAddressError } from '@/shared/errors/zeroAddressError'
import { useEffect, useMemo } from 'react'
import { useAlertContext } from '@/app/providers'

export const useGetGauge = (builder: Address) =>
  useReadContract({
    abi: BuilderRegistryAbi,
    address: BackersManagerAddress,
    functionName: 'builderToGauge',
    args: [builder as Address],
  })

export const useClaimAllRewards = (builder: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const { data: gauge, isPending: isGaugePending, error: gaugeError, isFetched } = useGetGauge(builder)

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

  const claimAllRewards = () => {
    return writeContractAsync({
      abi: GaugeAbi,
      address: gauge as Address,
      functionName: 'claimBuilderReward',
      args: [],
    })
  }

  return {
    isClaimFunctionReady,
    claimAllRewards: () => isClaimFunctionReady && claimAllRewards(),
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
}: Omit<ReturnType<typeof useClaimAllRewards>, 'isClaimFunctionReady' | 'claimAllRewards'>) => {
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
