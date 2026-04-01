'use client'

import { createContext, useContext, RefObject } from 'react'

type PortalContainerContextType = RefObject<HTMLElement | null> | null

/**
 * Context for portal container targeting.
 * When a Modal provides this context, tooltips and popovers inside it
 * will portal to the modal container instead of document.body.
 * This ensures their z-index is relative to the modal's stacking context.
 */
export const PortalContainerContext = createContext<PortalContainerContextType>(null)

/**
 * Hook to get the current portal container element.
 * Returns the modal container if inside a modal, null otherwise.
 * When null, portals should fall back to document.body (default behavior).
 */
export function usePortalContainer(): HTMLElement | null {
  const containerRef = useContext(PortalContainerContext)
  return containerRef?.current ?? null
}
