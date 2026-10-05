import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const getQuery = () => window.matchMedia?.(REDUCED_MOTION_QUERY)

const subscribe = (onChange: () => void) => {
  const query = getQuery()
  query?.addEventListener?.('change', onChange)
  return () => query?.removeEventListener?.('change', onChange)
}

const getSnapshot = () => getQuery()?.matches ?? false

/** The server cannot know the preference; the client settles it on hydration. */
const getServerSnapshot = () => false

/**
 * Whether the viewer asked their system for reduced motion, kept up to date when they change it.
 */
export const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
