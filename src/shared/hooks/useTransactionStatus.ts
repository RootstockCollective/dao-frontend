import { Hash } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

interface UseTransactionStatusResult {
  isTxPending: boolean
  isTxFailed: boolean
}

export const useTransactionStatus = (txHash: Hash | undefined): UseTransactionStatusResult => {
  const tx = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const { isPending: isTxPending, failureReason: isTxFailed } = tx

  return {
    isTxPending: !!(txHash && isTxPending && !isTxFailed),
    isTxFailed: !!(txHash && isTxFailed),
  }
}
