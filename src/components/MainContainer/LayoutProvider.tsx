'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { MAIN_CONTAINER_ID } from '@/lib/constants'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react'
import { usePathname } from 'next/navigation'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop)
  const toggleSidebar = () => setIsSidebarOpen(state => !state)
  const openSidebar = () => setIsSidebarOpen(true)
  const closeSidebar = () => setIsSidebarOpen(false)

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
  const mainContainerRef = useRef<HTMLDivElement | null>(null)
  const [drawerHeight, setDrawerHeight] = useState(0)
  const [showPadding, setShowPadding] = useState(false)

  const openDrawer = (content: ReactNode, closeOnRouteChange = false) => {
    setDrawerContent(content)
    setIsDrawerOpen(true)
    if (closeOnRouteChange) {
      setCloseOnRouteChange(true)
    }
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setDrawerContent(null)
  }

  const setDrawerRef = (ref: HTMLDivElement | null) => {
    drawerRef.current = ref
  }

  // Get and store main container reference once
  useEffect(() => {
    mainContainerRef.current = document.getElementById(MAIN_CONTAINER_ID) as HTMLDivElement | null
  }, [])

  // Update drawer height when drawer content changes
  useEffect(() => {
    if (drawerRef.current) {
      setDrawerHeight(drawerRef.current.offsetHeight)
    } else {
      setDrawerHeight(0)
    }
  }, [drawerContent])

  // Manage showPadding state
  useEffect(() => {
    if (isDrawerOpen && drawerHeight > 0) {
      setShowPadding(true)
    }
  }, [isDrawerOpen, drawerHeight])

  // Manage main container padding using stored ref
  useEffect(() => {
    const container = mainContainerRef.current
    if (!container) return

    container.style.transition = 'padding-bottom 0.3s ease-in-out'
    if (showPadding && drawerHeight > 0) {
      container.style.paddingBottom = `${drawerHeight}px`
    } else {
      container.style.paddingBottom = '0px'
    }

    return () => {
      if (container) {
        container.style.paddingBottom = '0px'
        container.style.transition = ''
      }
    }
  }, [drawerHeight, showPadding])

  // Reset showPadding when drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      setShowPadding(false)
    }
  }, [isDrawerOpen])

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
    [isSidebarOpen, isDrawerOpen, drawerContent],
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
