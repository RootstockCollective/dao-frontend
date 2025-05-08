'use client'
import { AlertProps } from '@/components/Alert/Alert'
import { createContext, FC, ReactNode, useContext, useState, useEffect } from 'react'

// Define the context without an initial value (which will be set by the provider)
interface AlertContextValue {
  message: AlertProps | null
  setMessage: (message: AlertProps | null) => void
  // Adding a function to preserve alerts during navigation/modal closing
  preserveCurrentAlert: () => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

interface Props {
  children: ReactNode
}

// Create the provider component
export const AlertProvider: FC<Props> = ({ children }) => {
  const [message, setMessage] = useState<AlertProps | null>(null)

  // Track if we're actively preserving an alert
  const [isPreserving, setIsPreserving] = useState(false)

  // Function to signal that current alert should persist
  const preserveCurrentAlert = () => {
    if (message) {
      setIsPreserving(true)
    }
  }

  // If preserving flag is set, don't clear message on unmount
  useEffect(() => {
    return () => {
      // If we're NOT preserving, clear message
      if (!isPreserving) {
        setMessage(null)
      }
      // Reset preserving flag for next time
      setIsPreserving(false)
    }
  }, [isPreserving])

  return (
    <AlertContext.Provider value={{ message, setMessage, preserveCurrentAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

// Hook to use the AlertContext
export const useAlertContext = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider')
  }
  return context
}
