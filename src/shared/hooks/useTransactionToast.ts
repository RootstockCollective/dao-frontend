import { useEffect, useRef } from 'react'
import { Id } from 'react-toastify'
import { useTxStatusMessage } from './useTxStatusMessage'
import { showToast, ToastAlertOptions, updateToast } from '../lib/toastUtils'

export const useTransactionToast = (txHash: string, onTxComplete: (hash: string) => void) => {
  const { txMessage } = useTxStatusMessage(txHash)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (txMessage) {
      const toastProps: ToastAlertOptions = {
        ...txMessage,
        dataTestId: `${txMessage.severity}-tx-${txHash}`,
        toastId: txHash as Id,
        txHash: txHash,
      }

      if (loadingRef.current) {
        // Update the existing toast
        updateToast(txHash as Id, toastProps)
        onTxComplete(txHash)
      } else {
        // Create a new toast
        showToast(toastProps)
        loadingRef.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txMessage])
}
