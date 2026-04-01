'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { createContext, useContext, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import type { PropsWithChildren, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import useLocalStorageState from 'use-local-storage-state'

interface LayoutState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  isDrawerOpen: boolean
  openDrawer: (content: ReactNode, closeOnRouteChange?: boolean) => void
  closeDrawer: () => void
  drawerContent: ReactNode | null
  setDrawerRef: (ref: HTMLDivElement | null) => void
}

const LayoutContext = createContext<LayoutState | null>(null)

/**
 * LayoutProvider manages global layout states for the entire application.
 * Currently handles sidebar visibility and drawer height management for proper
 * main container padding, but can be extended to manage other layout configurations
 * like theme, responsive settings, and other UI states.
 */
export function LayoutProvider({ children }: PropsWithChildren) {
  // on desktop the sidebar is initially open, on mobile - initially closed
  const isDesktop = useIsDesktop()
  // store sidebar state between browser reloads
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorageState<boolean>('menu-sidebar-open', {
    defaultValue: isDesktop,
  })
  const toggleSidebar = useCallback(() => setIsSidebarOpen(state => !state), [setIsSidebarOpen])
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [setIsSidebarOpen])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [setIsSidebarOpen])

  const [drawerContent, setDrawerContent] = useState<ReactNode | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [closeOnRouteChange, setCloseOnRouteChange] = useState(false)

  const pathname = usePathname()
  useEffect(() => {
    if (isDrawerOpen && closeOnRouteChange) {
      closeDrawer()
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refs for layout elements
  const drawerRef = useRef<HTMLDivElement | null>(null)

  const openDrawer = useCallback((content: ReactNode, closeOnRouteChange = false) => {
    setDrawerContent(content)
    setIsDrawerOpen(true)
    if (closeOnRouteChange) {
      setCloseOnRouteChange(true)
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setDrawerContent(null)
  }, [])

  const setDrawerRef = (ref: HTMLDivElement | null) => {
    drawerRef.current = ref
  }

  const value = useMemo<LayoutState>(
    () => ({
      isSidebarOpen,
      toggleSidebar,
      openSidebar,
      closeSidebar,
      isDrawerOpen,
      drawerContent,
      openDrawer,
      closeDrawer,
      setDrawerRef,
    }),
    [
      isSidebarOpen,
      isDrawerOpen,
      drawerContent,
      toggleSidebar,
      openSidebar,
      closeSidebar,
      openDrawer,
      closeDrawer,
    ],
  )
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

/**
 * Hook to access global layout states and control functions from any component.
 * Provides access to sidebar state, drawer state, and drawer height management.
 * Must be used within a LayoutProvider.
 */
export function useLayoutContext(): LayoutState {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new NoContextProviderError('useLayoutContext', 'LayoutProvider')
  }
  return context
}
