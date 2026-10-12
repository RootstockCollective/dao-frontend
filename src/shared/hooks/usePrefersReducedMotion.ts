import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const getQuery = () => window.matchMedia?.(REDUCED_MOTION_QUERY)

const subscribe = (onChange: () => void) => {
  const query = getQuery()
  query?.addEventListener?.('change', onChange)
  return () => query?.removeEventListener?.('change', onChange)
}

const getSnapshot = () => getQuery()?.matches ?? false

const getServerSnapshot = () => false

export const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
