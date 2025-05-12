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

export function useLayoutContext() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayoutContext must be used within an LayoutProvider')
  }
  return context
}
