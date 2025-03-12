import { useMemo } from 'react'
import {
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
  useWriteContract,
  UseWriteContractParameters,
  UseWriteContractReturnType,
} from 'wagmi'
import { useAwaitedTxReporting } from '../../shared'

export type UseResponsibleWriteContractParameters = UseWriteContractParameters & {
  title: string
  errorContent: string
}

export type UseResponsibleWriteContractReturnType = Omit<
  UseWriteContractReturnType,
  'error' | 'data' | 'failureReason'
> &
  Omit<UseWaitForTransactionReceiptReturnType, 'error' | 'data' | 'failureReason'> & {
    error: UseWriteContractReturnType['error'] | UseWaitForTransactionReceiptReturnType['error']
    data: UseWriteContractReturnType['data'] | UseWaitForTransactionReceiptReturnType['data']
    failureReason:
      | UseWriteContractReturnType['failureReason']
      | UseWaitForTransactionReceiptReturnType['failureReason']
  }

export const useResponsibleWriteContract = ({
  title,
  errorContent,
  ...params
}: UseResponsibleWriteContractParameters): UseResponsibleWriteContractReturnType => {
  const {
    data: hash,
    error: execError,
    isPending: execIsPending,
    isSuccess: execIsSuccess,
    ...rest
  } = useWriteContract(params)

  const {
    data,
    error: receiptError,
    isPending: receiptIsPending,
    isLoading,
    isSuccess: receiptIsSuccess,
    ...restOfReceipt
  } = useWaitForTransactionReceipt({ hash })

  const error = useMemo(() => execError ?? receiptError, [execError, receiptError])
  const isPending = useMemo(() => execIsPending ?? receiptIsPending, [execIsPending, receiptIsPending])
  const isSuccess = useMemo(() => execIsSuccess ?? receiptIsSuccess, [execIsSuccess, receiptIsSuccess])

  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title,
    errorContent,
  })

  return {
    data: data ?? hash,
    error,
    isPending,
    isLoading,
    isSuccess,
    ...rest,
    ...restOfReceipt,
  }
}
