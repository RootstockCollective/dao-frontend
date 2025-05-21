import { useEffect } from 'react'

let scrollLockCount = 0

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

    if (lock) {
      scrollLockCount++
      if (scrollLockCount === 1) {
        document.body.style.overflow = 'hidden'
      }
    }

    return () => {
      if (lock) {
        scrollLockCount--
        if (scrollLockCount <= 0) {
          document.body.style.overflow = ''
          scrollLockCount = 0
        }
      }
    }
  }, [lock])
}
