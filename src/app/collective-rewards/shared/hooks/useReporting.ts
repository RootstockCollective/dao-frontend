import { useHandleErrors } from '@/app/collective-rewards/utils'
import { showToast } from '@/shared/notification'
import { Merge, Rename } from '@/shared/utility'
import { useEffect } from 'react'
import { UseWaitForTransactionReceiptReturnType, UseWriteContractReturnType } from 'wagmi'

type AwaitedTxProps = Rename<
  Pick<UseWriteContractReturnType, 'error' | 'isSuccess' | 'isPending' | 'data'>,
  {
    isPending: 'isPendingTx'
    data: 'hash'
  }
>

type AwaitedReceiptProps = Rename<
  Pick<UseWaitForTransactionReceiptReturnType, 'isLoading' | 'error' | 'data'>,
  { data: 'receipt'; isLoading: 'isLoadingReceipt' }
>

type MergedProps = Merge<AwaitedTxProps, AwaitedReceiptProps>

type UseAwaitedTxReportingProps = Merge<
  MergedProps,
  {
    error: Error | null
  }
> & {
  title: string
  errorContent?: string
}

export const useAwaitedTxReporting = ({
  hash,
  error,
  isPendingTx,
  isLoadingReceipt,
  isSuccess,
  receipt,
  title,
  errorContent,
}: UseAwaitedTxReportingProps) => {
  useHandleErrors({ error, title, content: errorContent })

  useEffect(() => {
    if (isPendingTx) {
      showToast({
        title,
        content: 'Confirm transaction execution in your wallet',
        severity: 'info',
      })
    }
  }, [isPendingTx, title])

  useEffect(() => {
    if (isLoadingReceipt) {
      showToast({
        title,
        content: `Waiting for transaction ${hash} confirmation. See status details in your wallet.`,
        severity: 'info',
      })
    }
  }, [isLoadingReceipt, title, hash])

  useEffect(() => {
    if (isSuccess && receipt) {
      showToast({
        severity: 'success',
        title,
        content: `Transaction ${receipt.transactionHash} was successful`,
      })
    }
  }, [isSuccess, receipt, title])
}
