import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useTransactionToast } from '../hooks/useTransactionToast'

const TxStatusContext = createContext<{
  trackTransaction: (txHash: string) => void
} | null>(null)

type TransactionToastProps = {
  txHash: string
  onTxComplete: (hash: string) => void
}

const TransactionToast = memo(
  function TransactionToast({ txHash, onTxComplete }: TransactionToastProps) {
    useTransactionToast(txHash, onTxComplete)
    return null
  },
  // prevent re-rendering if txHash is the same
  (prevProps, nextProps) => prevProps.txHash === nextProps.txHash,
)

export const TxStatusProvider = ({ children }: { children: ReactNode }) => {
  const [activeTxs, setActiveTxs] = useState<Set<string>>(new Set())

  const trackTransaction = useCallback((txHash: string) => {
    setActiveTxs(prev => new Set(prev).add(txHash))
  }, [])

  const removeActiveTx = useCallback((txHash: string) => {
    setActiveTxs(prev => {
      const next = new Set(prev)
      next.delete(txHash)
      return next
    })
  }, [])

  const contextValue = useMemo(() => ({ trackTransaction }), [trackTransaction])

  return (
    <TxStatusContext.Provider value={contextValue}>
      {Array.from(activeTxs).map(txHash => (
        <TransactionToast key={txHash} txHash={txHash} onTxComplete={removeActiveTx} />
      ))}
      {children}
    </TxStatusContext.Provider>
  )
}

export const useTxStatusContext = () => {
  const context = useContext(TxStatusContext)
  if (!context) {
    throw new NoContextProviderError('useTxStatusContext', 'TxStatusProvider')
  }
  return context
}
