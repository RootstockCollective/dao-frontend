import { useEffect } from 'react'

/**
 * Disables page scrolling while the provided condition is true.
 *
 * This hook is typically used to prevent background scrolling
 * when modals, sidebars, or other overlay components are visible.
 *
 * Scrolling is automatically re-enabled when the condition becomes false
 * or when the component using the hook is unmounted.
 *
 * @param lock - A boolean indicating whether scrolling should be disabled.
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault()
    }

    const preventWheel = (e: WheelEvent) => {
      e.preventDefault()
    }

    if (lock) {
      document.addEventListener('touchmove', preventScroll, { passive: false })
      document.addEventListener('wheel', preventWheel, { passive: false })

      return () => {
        document.removeEventListener('touchmove', preventScroll)
        document.removeEventListener('wheel', preventWheel)
      }
    }

    // Return cleanup function for non-first locks
    return () => {
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('wheel', preventWheel)
    }
  }, [lock])
}
