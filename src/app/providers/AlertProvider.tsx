'use client'
import { AlertProps } from '@/components/Alert/Alert'
import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, FC, ReactNode, useContext, useState } from 'react'

// Define the context without an initial value (which will be set by the provider)
const AlertContext = createContext<{
  message: AlertProps | null
  setMessage: (message: AlertProps | null) => void
} | null>(null)

interface Props {
  children: ReactNode
}

// Create the provider component
export const AlertProvider: FC<Props> = ({ children }) => {
  const [message, setMessage] = useState<AlertProps | null>(null)
  return <AlertContext.Provider value={{ message, setMessage }}>{children}</AlertContext.Provider>
}

// Hook to use the AlertContext
export const useAlertContext = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new NoContextProviderError('useAlertContext', 'AlertProvider')
  }
  return context
}

export const withAlertContext = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    return (
      <AlertProvider>
        <Component {...props} />
      </AlertProvider>
    )
  }

  WrappedComponent.displayName = `withAlertContext(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
