import { useContext, useEffect, useRef, useState } from 'react'
import { createContext } from 'react'
import { Id } from 'react-toastify'
import { showToast, ToastAlertOptions, updateToast } from '../lib/toastUtils'
import { useTxStatusMessage } from '../hooks/useTxStatusMessage'
import { TxAction } from '../types'

const TxStatusContext = createContext<{
  setTxMessage: (txHash: string, txAction?: TxAction) => void
} | null>(null)

export const TxStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const toastIdRef = useRef<Record<string, Id>>({})
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)
  const [currentTxAction, setCurrentTxAction] = useState<TxAction | null>(null)
  const { txMessage } = useTxStatusMessage(currentTxHash, currentTxAction)

  useEffect(() => {
    if (txMessage && currentTxHash) {
      const toastProps: ToastAlertOptions = {
        ...txMessage,
        dataTestId: `${txMessage.severity}-tx-${currentTxHash}`,
        toastId: currentTxHash,
      }

      if (toastIdRef.current[currentTxHash]) {
        // Update the existing toast
        updateToast(toastIdRef.current[currentTxHash], toastProps)
      } else {
        // Create a new toast
        const toastId = showToast(toastProps)
        toastIdRef.current[currentTxHash] = toastId
      }
    }
  }, [txMessage, currentTxHash])

  const setTxMessage = (txHash: string, txAction?: TxAction) => {
    setCurrentTxHash(txHash)
    if (txAction) {
      setCurrentTxAction(txAction)
    }
  }

  return <TxStatusContext.Provider value={{ setTxMessage }}>{children}</TxStatusContext.Provider>
}

export const useTxStatusContext = () => {
  const context = useContext(TxStatusContext)
  if (!context) {
    throw new Error('useTxStatusContext must be used within a TxStatusProvider')
  }
  return context
}
