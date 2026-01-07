'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'
import { SwappingContextValue } from './types'

export const SwappingContext = createContext<SwappingContextValue | null>(null)

export const useSwappingContext = (): SwappingContextValue => {
  const context = useContext(SwappingContext)
  if (!context) {
    throw new NoContextProviderError('useSwappingContext', 'SwappingProvider')
  }
  return context
}
