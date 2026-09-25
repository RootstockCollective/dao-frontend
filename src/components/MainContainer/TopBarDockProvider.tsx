'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import { NoContextProviderError } from '@/lib/errors/ContextError'

interface TopBarDockState {
  /** A page has a prompt that can dock under the top bar. The top bar sticks while it does. */
  isActive: boolean
  /** The prompt is docked right now, so the top bar hides its own Connect button. */
  isDocked: boolean
  /** Element under the top bar row that the page portals its docked prompt into. */
  slot: HTMLDivElement | null
  setActive: (isActive: boolean) => void
  setDocked: (isDocked: boolean) => void
  setSlot: (slot: HTMLDivElement | null) => void
}

const TopBarDockContext = createContext<TopBarDockState | null>(null)

/**
 * Lets a page dock a compact prompt under the top bar, which lives in the layout.
 *
 * The header renders the slot and reacts to the state (sticky while a prompt is active, Connect
 * button hidden while it is docked); the page owns the prompt and portals it into the slot.
 * Used by the Holdings Don't Miss banner.
 */
export function TopBarDockProvider({ children }: PropsWithChildren) {
  const [isActive, setActive] = useState(false)
  const [isDocked, setDocked] = useState(false)
  const [slot, setSlot] = useState<HTMLDivElement | null>(null)

  const value = useMemo(
    () => ({ isActive, isDocked: isActive && isDocked, slot, setActive, setDocked, setSlot }),
    [isActive, isDocked, slot],
  )

  return <TopBarDockContext.Provider value={value}>{children}</TopBarDockContext.Provider>
}

export function useTopBarDock(): TopBarDockState {
  const context = useContext(TopBarDockContext)
  if (!context) {
    throw new NoContextProviderError('useTopBarDock', 'TopBarDockProvider')
  }
  return context
}
