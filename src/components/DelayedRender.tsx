'use client'

import { useState, useEffect, PropsWithChildren, ReactNode } from 'react'

/**
 * A component that prevents hydration mismatch by only rendering its children after client-side hydration is complete.
 * This is useful for components that rely on browser APIs or have different server/client rendered content.
 */
export function DelayedRender({ children }: PropsWithChildren): ReactNode | null {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted ? children : null
}
