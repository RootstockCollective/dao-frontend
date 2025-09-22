'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'
import { BackingAction } from './types'

export const BackingActionsContext = createContext<React.Dispatch<BackingAction> | null>(null)

export const useBackingActionsContext = () => {
  const context = useContext(BackingActionsContext)

  if (!context) {
    throw new NoContextProviderError('useBackingActionsContext', 'BackingProvider')
  }
  return context
}
