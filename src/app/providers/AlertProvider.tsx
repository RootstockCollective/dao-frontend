'use client'
import { AlertProps } from '@/components/Alert/Alert'
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
    throw new Error('useAlertContext must be used within an AlertProvider')
  }
  return context
}
