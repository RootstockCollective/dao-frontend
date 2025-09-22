'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'
import { BackingState } from '.'

export const initialState: BackingState = {}

export const BackingContext = createContext<BackingState>(initialState)

export const useBackingContext = () => {
  const context = useContext(BackingContext)
  if (!context) {
    throw new NoContextProviderError('useBackingContext', 'BackingProvider')
  }

  return context
}
