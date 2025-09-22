'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'

export const BackingActionsContext = createContext<React.Dispatch<any> | null>(null) // FIXME: replace 'any' with specific action type when available

export const useBackingActionsContext = () => {
  const context = useContext(BackingActionsContext)

  if (!context) {
    throw new NoContextProviderError('useBackingActionsContext', 'BackingProvider')
  }
  return context
}
