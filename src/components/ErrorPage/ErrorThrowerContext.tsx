import { createContext, ReactNode, useContext, useState } from 'react'

export const ErrorThrowerContext = createContext<{
  triggerError: (error: string) => void
}>({
  triggerError: error => {},
})
/**
 * The mere purpose of this component is to throw error so that ErrorBoundary can catch it.
 * @param children
 * @constructor
 */
export const ErrorThrowerContextProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState('')
  if (error !== '') {
    throw new Error(error)
  }
  const value = {
    triggerError: setError,
  }
  return <ErrorThrowerContext.Provider value={value}>{children}</ErrorThrowerContext.Provider>
}

export const useErrorThrowerContext = () => useContext(ErrorThrowerContext)
