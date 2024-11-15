import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useAlertContext } from '@/app/providers'
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

export type UseAwaitedTxReportingProps = Merge<
  MergedProps,
  {
    error: Error | null
  }
> & {
  title: string
}

export const useAwaitedTxReporting = ({
  hash,
  error,
  isPendingTx,
  isLoadingReceipt,
  isSuccess,
  receipt,
  title,
}: UseAwaitedTxReportingProps) => {
  const { setMessage } = useAlertContext()
  useHandleErrors({ error, title })

  useEffect(() => {
    if (isPendingTx) {
      setMessage({
        severity: 'info',
        content: 'Confirm transaction execution in your wallet',
        title,
      })
    }
  }, [isPendingTx, setMessage, title])

  useEffect(() => {
    if (isLoadingReceipt) {
      setMessage({
        severity: 'info',
        content: `Waiting for transaction  ${hash} confirmation. See status details in your wallet.`,
        title,
      })
    }
  }, [isLoadingReceipt, setMessage, title, hash])

  useEffect(() => {
    if (isSuccess && receipt) {
      setMessage({
        severity: 'success',
        title,
        content: `Transaction ${receipt.transactionHash} was successful`,
      })
    }
  }, [isSuccess, receipt, setMessage, title])
}
