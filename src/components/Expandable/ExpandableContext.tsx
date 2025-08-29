'use client'
import { createContext, useContext } from 'react'

// Context for sharing state between compound components
export interface ContextType {
  isExpanded: boolean
  toggleExpanded: () => void
}

export const ExpandableContext = createContext<ContextType | null>(null)

export const useExpandableContext = () => {
  const context = useContext(ExpandableContext)
  if (!context) {
    throw new Error('Expandable compound components must be used within ExpandableContent')
  }
  return context
}
