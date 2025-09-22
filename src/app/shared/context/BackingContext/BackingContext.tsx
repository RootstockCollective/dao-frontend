'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'
import { BackingState } from '.'

export const initialState: BackingState = {
  backings: {},
  balance: { onchain: 0n, pending: 0n },
  totalBacking: { onchain: 0n, pending: 0n },
  backedBuilderCount: { onchain: 0, pending: 0 },
  isLoading: false,
  error: null,
}

export const BackingContext = createContext<BackingState>(initialState)

export const useBackingContext = () => {
  const context = useContext(BackingContext)
  if (!context) {
    throw new NoContextProviderError('useBackingContext', 'BackingProvider')
  }

  return context
}
