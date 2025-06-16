'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'

interface LayoutState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

const LayoutContext = createContext<LayoutState | null>(null)

/**
 * LayoutProvider manages global layout states for the entire application.
 * Currently handles sidebar visibility, but can be extended to manage other
 * layout configurations like theme, responsive settings, and other UI states.
 */
export function LayoutProvider({ children }: PropsWithChildren) {
  // on desktop the sidebar is initially open, on mobile - initially closed
  const isDesktop = useIsDesktop()
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop)
  const toggleSidebar = () => setIsSidebarOpen(state => !state)
  const openSidebar = () => setIsSidebarOpen(true)
  const closeSidebar = () => setIsSidebarOpen(false)
  const value = useMemo<LayoutState>(
    () => ({
      isSidebarOpen,
      toggleSidebar,
      openSidebar,
      closeSidebar,
    }),
    [isSidebarOpen],
  )
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

/**
 * Hook to access global layout states and control functions from any component.
 * Provides access to sidebar state and can be extended for other layout configurations.
 * Must be used within a LayoutProvider.
 */
export function useLayoutContext(): LayoutState {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new NoContextProviderError('useLayoutContext', 'LayoutProvider')
  }
  return context
}
