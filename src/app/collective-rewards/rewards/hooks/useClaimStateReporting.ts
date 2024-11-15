import { useEffect } from 'react'
import { useAlertContext } from '@/app/providers'
import { useClaimBackerRewards, useClaimBuilderRewards } from '@/app/collective-rewards/rewards'

export const useClaimStateReporting = ({
  error,
  isPendingTx,
  isLoadingReceipt,
  isSuccess,
  receipt,
}: Omit<
  ReturnType<typeof useClaimBackerRewards | typeof useClaimBuilderRewards>,
  'isClaimFunctionReady' | 'claimRewards'
>) => {
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
        title: 'Claiming rewards',
      })
    }
  }, [isPendingTx, setMessage])

  useEffect(() => {
    if (isLoadingReceipt) {
      setMessage({
        severity: 'info',
        content: 'Waiting for transaction confirmation. See status details in your wallet.',
        title: 'Claiming rewards',
      })
    }
  }, [isLoadingReceipt, setMessage])

  useEffect(() => {
    if (isSuccess && receipt) {
      setMessage({
        severity: 'success',
        title: 'Claiming rewards',
        content: `Successfully claimed in tx: ${receipt.transactionHash}`,
      })
    }
  }, [isSuccess, receipt, setMessage])
}
