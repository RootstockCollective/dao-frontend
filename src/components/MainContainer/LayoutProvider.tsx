'use client'

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

interface LayoutState {
  isSidebarOpen: boolean
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>
  toggleSidebar: () => void
}

const LayoutContext = createContext<LayoutState | null>(null)

/**
 * LayoutProvider manages global layout states for the entire application.
 * Currently handles sidebar visibility, but can be extended to manage other
 * layout configurations like theme, responsive settings, and other UI states.
 */
export function LayoutProvider({ children }: PropsWithChildren) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const toggleSidebar = () => setIsSidebarOpen(state => !state)
  const value = useMemo<LayoutState>(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
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
export function useLayoutContext() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayoutContext must be used within an LayoutProvider')
  }
  return context
}
