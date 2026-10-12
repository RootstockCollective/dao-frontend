'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { NoContextProviderError } from '@/lib/errors/ContextError'

interface TopBarDockState {
  isActive: boolean
  isDocked: boolean
  slot: HTMLDivElement | null
  setActive: (isActive: boolean) => void
  setDocked: (isDocked: boolean) => void
  setSlot: (slot: HTMLDivElement | null) => void
}

const TopBarDockContext = createContext<TopBarDockState | null>(null)

export function TopBarDockProvider({ children }: PropsWithChildren) {
  const [isActive, setActive] = useState(false)
  const [isDocked, setDocked] = useState(false)
  const [slot, setSlot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isActive || !slot) return

    const root = document.documentElement
    const update = () =>
      root.style.setProperty('scroll-padding-top', `${slot.offsetTop + slot.offsetHeight}px`)

    update()
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    resizeObserver?.observe(slot)
    if (slot.parentElement) resizeObserver?.observe(slot.parentElement)

    return () => {
      resizeObserver?.disconnect()
      root.style.removeProperty('scroll-padding-top')
    }
  }, [isActive, slot])

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
