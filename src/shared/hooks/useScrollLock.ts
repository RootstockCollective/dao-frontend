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
    if (typeof document === 'undefined') return // ✅ SSR safety

    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevTouchAction = body.style.touchAction

    if (lock) {
      scrollLockCount++
      if (scrollLockCount === 1) {
        // First lock → actually apply styles
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
        body.style.touchAction = 'none' // iOS Safari fix
      }
    }

    return () => {
      if (lock) {
        scrollLockCount--
        if (scrollLockCount <= 0) {
          html.style.overflow = prevHtmlOverflow
          body.style.overflow = prevBodyOverflow
          body.style.touchAction = prevTouchAction
        }
      }
    }
  }, [lock])
}
