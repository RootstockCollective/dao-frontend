import { useEffect } from 'react'
import { Hash } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'

interface UseTransactionStatusResult {
  isTxPending: boolean
  isTxFailed: boolean
}

export const useTransactionStatus = (txHash: Hash | undefined): UseTransactionStatusResult => {
  const { trackTransaction } = useTxStatusContext()

  const tx = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const { isPending: isTxPending, failureReason: isTxFailed } = tx

  useEffect(() => {
    if (txHash) {
      trackTransaction(txHash)
    }
  }, [txHash, trackTransaction])

  return {
    isTxPending: !!(txHash && isTxPending && !isTxFailed),
    isTxFailed: !!(txHash && isTxFailed),
  }
}
