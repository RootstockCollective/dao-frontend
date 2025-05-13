import { createContext, memo, useContext, useEffect, useRef, useState } from 'react'
import { Id } from 'react-toastify'
import { useTxStatusMessage } from '../hooks/useTxStatusMessage'
import { showToast, ToastAlertOptions, updateToast } from '../lib/toastUtils'

const TxStatusContext = createContext<{
  trackTransaction: (txHash: string) => void
} | null>(null)

const TransactionToast = memo(
  function TransactionToast({ txHash, onClose }: { txHash: string; onClose: (hash: string) => void }) {
    const { txMessage } = useTxStatusMessage(txHash)
    const loadingRef = useRef(false)

    useEffect(() => {
      if (txMessage) {
        const toastProps: ToastAlertOptions = {
          ...txMessage,
          dataTestId: `${txMessage.severity}-tx-${txHash}`,
          toastId: txHash as Id,
          txHash: txHash,
          onClose: () => onClose(txHash),
        }

        if (loadingRef.current) {
          // Update the existing toast
          updateToast(txHash as Id, toastProps)
        } else {
          // Create a new toast
          showToast(toastProps)
          loadingRef.current = true
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txMessage])

    return null
  },
  // prevent re-rendering if txHash is the same
  (prevProps, nextProps) => prevProps.txHash === nextProps.txHash,
)

export const TxStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTxs, setActiveTxs] = useState<string[]>([])

  const trackTransaction = (txHash: string) => {
    setActiveTxs(prev => (prev.includes(txHash) ? prev : [...prev, txHash]))
  }

  const removeActiveTx = (txHash: string) => {
    setActiveTxs(prev => prev.filter(tx => tx !== txHash))
  }

  return (
    <TxStatusContext.Provider value={{ trackTransaction }}>
      {activeTxs.map(txHash => (
        <TransactionToast key={txHash} txHash={txHash} onClose={removeActiveTx} />
      ))}
      {children}
    </TxStatusContext.Provider>
  )
}

export const useTxStatusContext = () => {
  const context = useContext(TxStatusContext)
  if (!context) {
    throw new Error('useTxStatusContext must be used within a TxStatusProvider')
  }
  return context
}
